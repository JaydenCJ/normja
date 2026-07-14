/**
 * Fault-tolerant Japanese address normalization.
 *
 * Designed for post-processing messy sources — OCR text, spreadsheet
 * exports and LLM-extracted fields — where labels, mixed widths, kanji
 * numerals, old glyph forms and missing prefectures are all common.
 * Everything runs offline against embedded dictionaries.
 */

import { CITY_TO_PREFECTURE, DESIGNATED_CITIES } from "./data/cities.js";
import { PREFECTURES } from "./data/prefectures.js";
import { normalizeBlocks } from "./blocks.js";
import { normalizeKyujitai } from "../text/kyujitai.js";
import { normalizeWidth } from "../text/width.js";

/** Machine-readable notes attached to a normalization result. */
export type AddressWarning =
  /** Prefecture was absent and filled in from a unique city match. */
  | "prefecture-inferred"
  /** City exists in more than one prefecture; nothing was inferred. */
  | "ambiguous-city"
  /** No prefecture found and none could be inferred. */
  | "prefecture-missing"
  /** No city segment could be identified. */
  | "city-not-found"
  /** Stated prefecture disagrees with the dictionary entry for the city. */
  | "city-prefecture-mismatch"
  /** A ward name appeared without its designated city (e.g. 北区 in Osaka). */
  | "ward-without-city"
  /** Building segment was split off heuristically. */
  | "building-heuristic";

/** Result of {@link normalizeAddress}. */
export interface NormalizedAddress {
  /** 7-digit postal code found in the input, without hyphen, or null. */
  postalCode: string | null;
  /** Prefecture (都道府県), e.g. 東京都, or null when unknown. */
  prefecture: string | null;
  /**
   * Municipality (市区町村). For designated cities this includes the ward
   * (e.g. 横浜市西区); null when no city segment was recognized.
   */
  city: string | null;
  /** Town and block part after the city, in canonical dash style. */
  area: string;
  /** Building/floor part when one was detected, or null. */
  building: string | null;
  /** Canonical single-line address: prefecture + city + area (+ building). */
  normalized: string;
  /** Notes about inference and anything suspicious. Empty means clean. */
  warnings: AddressWarning[];
}

/** Longest-first city names for prefix matching. */
const CITY_NAMES_BY_LENGTH = Object.keys(CITY_TO_PREFECTURE).sort(
  (a, b) => b.length - a.length,
);

/**
 * Tokyo special wards whose names ALSO exist as administrative wards
 * inside designated cities elsewhere (大阪市北区, 名古屋市港区, …).
 * Only these are ambiguous; the other 20 special ward names are unique
 * municipality names nationwide.
 */
const AMBIGUOUS_WARD_NAMES = new Set(["中央区", "北区", "港区"]);

/** Leading labels that LLM output and spreadsheets prepend to addresses. */
const LABEL_PREFIX_RE = /^(?:住所|所在地|お届け先|勤務地|Address)\s*[:：=]?\s*/i;

/** Building keywords that justify splitting without a whitespace boundary. */
const BUILDING_KEYWORD_RE =
  /(ビル|タワー|ヒルズ|マンション|ハイツ|コーポ|レジデンス|アパート|会館|庁舎|号館|号室|[0-9]+階|[0-9]+F)/;

function stripEnclosure(s: string): string {
  const pairs: ReadonlyArray<readonly [string, string]> = [
    ["「", "」"], ["『", "』"], ["【", "】"], ["（", "）"], ["(", ")"],
    ["\"", "\""], ["'", "'"],
  ];
  let out = s.trim();
  for (const [open, close] of pairs) {
    if (out.startsWith(open) && out.endsWith(close) && out.length > 2) {
      out = out.slice(open.length, out.length - close.length).trim();
    }
  }
  return out;
}

interface PostalExtraction {
  postalCode: string | null;
  rest: string;
}

function extractPostalCode(s: string): PostalExtraction {
  // With a 〒 mark the code can appear anywhere; without it, only a code
  // at the very beginning is safe to treat as postal.
  const marked = s.match(/〒\s*(\d{3})\s*-?\s*(\d{4})/);
  if (marked) {
    return {
      postalCode: `${marked[1]}${marked[2]}`,
      rest: s.replace(marked[0], " ").replace(/\s+/g, " ").trim(),
    };
  }
  const leading = s.match(/^(\d{3})-(\d{4})\s*/);
  if (leading) {
    return {
      postalCode: `${leading[1]}${leading[2]}`,
      rest: s.slice(leading[0].length).trim(),
    };
  }
  return { postalCode: null, rest: s };
}

interface CityMatch {
  city: string;
  rest: string;
  prefectures: readonly string[] | null;
}

function matchCity(s: string, statedPrefecture: string | null): CityMatch | null {
  for (const name of CITY_NAMES_BY_LENGTH) {
    if (!s.startsWith(name)) continue;
    // Ward names like 北区/中央区/港区 map to Tokyo in the dictionary but
    // also exist inside designated cities. Trust the dictionary only when
    // the stated prefecture is Tokyo or absent.
    if (
      AMBIGUOUS_WARD_NAMES.has(name) &&
      statedPrefecture !== null &&
      statedPrefecture !== "東京都"
    ) {
      continue;
    }
    let city = name;
    let rest = s.slice(name.length);
    if (DESIGNATED_CITIES.has(name)) {
      const ward = rest.match(/^([^\s\d]{1,5}?区)/);
      if (ward) {
        city += ward[1];
        rest = rest.slice((ward[1] as string).length);
      }
    }
    return { city, rest, prefectures: CITY_TO_PREFECTURE[name] ?? null };
  }
  // Generic fallback patterns for municipalities outside the dictionary.
  const gun = s.match(/^([^\s\d]{1,8}?郡[^\s\d]{1,8}?[町村])/);
  if (gun) {
    return {
      city: gun[1] as string,
      rest: s.slice((gun[1] as string).length),
      prefectures: null,
    };
  }
  const simple = s.match(/^([^\s\d]{1,8}?[市区町村])/);
  if (simple) {
    const city = simple[1] as string;
    return { city, rest: s.slice(city.length), prefectures: null };
  }
  return null;
}

interface BuildingSplit {
  area: string;
  building: string | null;
  heuristic: boolean;
}

function splitBuilding(rest: string): BuildingSplit {
  // Preferred: whitespace boundary after a block number.
  const bySpace = rest.match(/^(.*?\d(?:-\d+)*)\s+(\S.*)$/);
  if (bySpace) {
    return {
      area: (bySpace[1] as string).trim(),
      building: (bySpace[2] as string).trim(),
      heuristic: false,
    };
  }
  // Fallback: a trailing non-numeric run glued to the block number that
  // contains an unmistakable building keyword.
  const glued = rest.match(/^(.*?\d(?:-\d+)*)([^\d\s-].*)$/);
  if (glued && BUILDING_KEYWORD_RE.test(glued[2] as string)) {
    return {
      area: (glued[1] as string).trim(),
      building: (glued[2] as string).trim(),
      heuristic: true,
    };
  }
  return { area: rest.trim(), building: null, heuristic: false };
}

/**
 * Normalize a Japanese address string into structured components and a
 * canonical single-line form.
 *
 * Tolerates: full-width/half-width mixtures, old-form kanji (區/縣/髙…),
 * kanji block numerals (一丁目九番一号), 〒 postal prefixes, leading labels
 * such as 住所:, missing prefectures (inferred from a unique city), and
 * assorted dash variants. Runs fully offline; no network access.
 */
export function normalizeAddress(input: string): NormalizedAddress {
  const warnings: AddressWarning[] = [];

  let s = normalizeWidth(input.replace(/[\r\n]+/g, " "));
  s = stripEnclosure(s);
  s = s.replace(LABEL_PREFIX_RE, "");
  s = normalizeKyujitai(s);

  const postal = extractPostalCode(s);
  s = postal.rest;

  // Prefecture: full official name first.
  let prefecture: string | null = null;
  for (const p of PREFECTURES) {
    if (s.startsWith(p.name)) {
      prefecture = p.name;
      s = s.slice(p.name.length);
      break;
    }
  }
  // Suffix-less prefecture (東京, 大阪…) — but never when the same prefix
  // actually starts a city name in the dictionary (京都市 vs 京都).
  if (prefecture === null) {
    const cityFirst = matchCity(s, null);
    if (cityFirst === null || cityFirst.prefectures === null) {
      for (const p of PREFECTURES) {
        if (p.short !== p.name && s.startsWith(p.short)) {
          prefecture = p.name;
          s = s.slice(p.short.length);
          break;
        }
      }
    }
  }
  s = s.replace(/^\s+/, "");

  // City / municipality.
  const cityMatch = matchCity(s, prefecture);
  let city: string | null = null;
  if (cityMatch !== null) {
    city = cityMatch.city;
    s = cityMatch.rest.replace(/^\s+/, "");
    const dictPrefs = cityMatch.prefectures;
    if (dictPrefs !== null) {
      if (prefecture === null) {
        if (dictPrefs.length === 1) {
          prefecture = dictPrefs[0] as string;
          warnings.push("prefecture-inferred");
        } else {
          warnings.push("ambiguous-city");
        }
      } else if (!dictPrefs.includes(prefecture)) {
        warnings.push("city-prefecture-mismatch");
      }
    } else if (
      prefecture !== null &&
      prefecture !== "東京都" &&
      /^[^市]{1,5}区$/.test(city) &&
      !city.includes("市")
    ) {
      // A bare ward outside Tokyo usually means the designated city name
      // was dropped (e.g. 大阪府北区梅田 for 大阪市北区梅田).
      warnings.push("ward-without-city");
    }
  } else {
    warnings.push("city-not-found");
  }
  if (prefecture === null) {
    warnings.push("prefecture-missing");
  }

  // Town / block / building.
  const blockNormalized = normalizeBlocks(s);
  const split = splitBuilding(blockNormalized);
  if (split.heuristic) warnings.push("building-heuristic");
  // Whitespace inside the area segment carries no information once the
  // building has been split off (e.g. "丸の内 1-9-1" -> "丸の内1-9-1").
  const area = split.area.replace(/\s+/g, "");

  const normalized =
    [prefecture ?? "", city ?? "", area].join("") +
    (split.building !== null ? ` ${split.building}` : "");

  return {
    postalCode: postal.postalCode,
    prefecture,
    city,
    area,
    building: split.building,
    normalized,
    warnings,
  };
}
