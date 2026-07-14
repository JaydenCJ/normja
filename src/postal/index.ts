/**
 * Bidirectional postal code lookup, fully offline.
 *
 * Forward:  7-digit code -> address components.
 * Reverse:  address-ish string -> candidate codes.
 *
 * The module-level convenience functions run against the built-in sample
 * dataset (well-known districts of major cities). For nationwide coverage
 * build a {@link PostalIndex} from the full KEN_ALL dataset converted with
 * the `normja-kenall` CLI.
 */

import { SAMPLE_POSTAL_RECORDS } from "./data/sample-records.js";
import type { PostalRecord } from "./types.js";
import { PREFECTURES } from "../address/data/prefectures.js";
import { normalizeKyujitai } from "../text/kyujitai.js";
import { toHalfWidthAscii, normalizeWidth } from "../text/width.js";

/**
 * Normalize a postal code found in free text to 7 digits, or null when the
 * input cannot be a postal code. Accepts 〒 marks, full-width digits and a
 * hyphen: "〒１００−０００５" -> "1000005".
 */
export function normalizePostalCode(input: string): string | null {
  let s = toHalfWidthAscii(input).trim();
  s = s.replace(/^〒\s*/, "");
  s = s.replace(/[-‐‑‒–—―−ー]/g, "");
  s = s.replace(/\s+/g, "");
  return /^\d{7}$/.test(s) ? s : null;
}

/**
 * Format a 7-digit postal code with the customary hyphen:
 * "1000005" -> "100-0005". Returns null for anything that does not
 * normalize to 7 digits.
 */
export function formatPostalCode(input: string): string | null {
  const code = normalizePostalCode(input);
  if (code === null) return null;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/** A reverse-lookup hit with its match strength. */
export interface PostalSearchHit {
  record: PostalRecord;
  /**
   * 2 = the town name matched; 1 = only the city matched
   * (catch-all records can only ever match at strength 1).
   */
  score: 1 | 2;
}

/**
 * An in-memory index over {@link PostalRecord}s providing code -> address
 * and address -> code lookups. Construction cost is one pass over the
 * records; lookups are O(1) / O(n) respectively.
 */
export class PostalIndex {
  private readonly byCodeMap = new Map<string, PostalRecord[]>();
  private readonly records: readonly PostalRecord[];

  constructor(records: readonly PostalRecord[]) {
    this.records = records;
    for (const rec of records) {
      const list = this.byCodeMap.get(rec.code);
      if (list) list.push(rec);
      else this.byCodeMap.set(rec.code, [rec]);
    }
  }

  /** Number of records in the index. */
  get size(): number {
    return this.records.length;
  }

  /**
   * Forward lookup: postal code (any accepted format) -> matching records.
   * Returns an empty array for unknown or malformed codes.
   */
  byCode(input: string): PostalRecord[] {
    const code = normalizePostalCode(input);
    if (code === null) return [];
    return [...(this.byCodeMap.get(code) ?? [])];
  }

  /**
   * Reverse lookup: find postal codes whose address components appear in
   * the query string. The query can be a full address ("東京都千代田区
   * 丸の内1-9-1"), a fragment ("千代田区丸の内") or a town name alone.
   * Hits with both city and town matched rank before city-only hits;
   * ties break by town length (more specific first), then by code.
   */
  byAddress(query: string): PostalSearchHit[] {
    const q = normalizeKyujitai(normalizeWidth(query)).replace(/\s+/g, "");
    if (q.length === 0) return [];
    // A prefecture stated in the query rules out records elsewhere.
    const statedPrefectures = PREFECTURES.filter((p) =>
      q.includes(p.name),
    ).map((p) => p.name);
    const hits: PostalSearchHit[] = [];
    for (const rec of this.records) {
      if (
        statedPrefectures.length > 0 &&
        !statedPrefectures.includes(rec.prefecture)
      ) {
        continue;
      }
      const cityMatched = q.includes(rec.city);
      // Match the town outside the city name so that e.g. the town 千代田
      // does not fire on the 千代田区 part of the query.
      const qWithoutCity = cityMatched ? q.replaceAll(rec.city, "") : q;
      const townMatched = rec.town !== "" && qWithoutCity.includes(rec.town);
      if (!cityMatched && !townMatched) continue;
      hits.push({ record: rec, score: townMatched ? 2 : 1 });
    }
    hits.sort(
      (a, b) =>
        b.score - a.score ||
        // More specific matches first: longer city, then longer town.
        b.record.city.length - a.record.city.length ||
        b.record.town.length - a.record.town.length ||
        a.record.code.localeCompare(b.record.code),
    );
    return hits;
  }
}

let defaultIndex: PostalIndex | null = null;

/**
 * The lazily-built index over the built-in sample dataset.
 * Import has no side effects; the index is created on first use.
 */
export function getDefaultPostalIndex(): PostalIndex {
  if (defaultIndex === null) {
    defaultIndex = new PostalIndex(SAMPLE_POSTAL_RECORDS);
  }
  return defaultIndex;
}

/**
 * Forward lookup against the built-in sample dataset.
 * See {@link PostalIndex.byCode}; for nationwide data build your own index.
 */
export function lookupPostalCode(input: string): PostalRecord[] {
  return getDefaultPostalIndex().byCode(input);
}

/**
 * Reverse lookup against the built-in sample dataset.
 * See {@link PostalIndex.byAddress}.
 */
export function searchPostalCode(query: string): PostalSearchHit[] {
  return getDefaultPostalIndex().byAddress(query);
}
