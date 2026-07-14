/**
 * Parser for Japan Post KEN_ALL postal code CSV data
 * (utf_ken_all.csv / ken_all.csv converted to UTF-8).
 *
 * Column layout (Japan Post download page, "郵便番号データの説明"):
 *   0 JIS X 0402 municipality code
 *   1 old 5-digit postal code
 *   2 7-digit postal code
 *   3 prefecture kana   4 city kana   5 town kana
 *   6 prefecture        7 city        8 town
 *   9..14 numeric flags
 *
 * Known quirks handled here, each documented in Japan Post's own data
 * notes and well known to KEN_ALL consumers:
 *  - a town field longer than 38 full-width characters is SPLIT across
 *    consecutive rows; the continuation is detected by an unbalanced
 *    opening parenthesis in the town column;
 *  - the pseudo town 以下に掲載がない場合 means "everything not listed"
 *    and becomes an empty town (catch-all record);
 *  - parenthesized qualifiers (丁目 ranges, exclusions, その他) are
 *    stripped from the town name for matching purposes;
 *  - kana columns are half-width katakana and are converted to full-width.
 */

import type { PostalRecord } from "./types.js";
import { toFullWidthKana } from "../text/width.js";

/** Minimal CSV line parser: handles double-quoted fields with commas. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function parenBalance(s: string): number {
  let n = 0;
  for (const ch of s) {
    if (ch === "（" || ch === "(") n++;
    if (ch === "）" || ch === ")") n--;
  }
  return n;
}

/** Remove parenthesized qualifiers, full-width or half-width parens. */
function stripParenthetical(s: string): string {
  return s.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
}

const CATCH_ALL_TOWN = "以下に掲載がない場合";

/**
 * Parse KEN_ALL-format CSV text (UTF-8) into {@link PostalRecord}s.
 *
 * Continuation rows are merged, catch-all pseudo towns become empty town
 * strings, parenthesized qualifiers are stripped and kana is normalized
 * to full-width katakana. Rows with fewer than 9 columns are skipped.
 */
export function parseKenAllCsv(csvText: string): PostalRecord[] {
  const records: PostalRecord[] = [];
  let pending: string[] | null = null;

  for (const rawLine of csvText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    const cols = parseCsvLine(line);
    if (cols.length < 9) continue;

    if (pending !== null) {
      // Merge continuation of an over-long town name (same postal code).
      pending[5] = (pending[5] ?? "") + (cols[5] ?? "");
      pending[8] = (pending[8] ?? "") + (cols[8] ?? "");
    } else {
      pending = cols;
    }

    if (parenBalance(pending[8] ?? "") > 0) {
      continue; // still inside a split town name
    }

    const town = pending[8] ?? "";
    const townClean =
      town === CATCH_ALL_TOWN ? "" : stripParenthetical(town);
    const townKanaClean =
      town === CATCH_ALL_TOWN
        ? ""
        : stripParenthetical(toFullWidthKana(pending[5] ?? ""));

    records.push({
      code: pending[2] ?? "",
      jis: pending[0] ?? "",
      prefecture: pending[6] ?? "",
      city: pending[7] ?? "",
      town: townClean,
      prefectureKana: toFullWidthKana(pending[3] ?? ""),
      cityKana: toFullWidthKana(pending[4] ?? ""),
      townKana: townKanaClean,
    });
    pending = null;
  }

  return records;
}
