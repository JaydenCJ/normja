/**
 * Katakana reading estimation for Japanese person names.
 *
 * Purely dictionary-based and deterministic: no model, no network. The
 * dictionaries cover common surnames and given names; anything outside
 * them yields a null reading with a lowered confidence instead of a wrong
 * guess. This is designed for post-processing LLM-extracted customer
 * records where a wrong furigana is worse than an empty one.
 */

import { GIVEN_NAMES } from "./data/given-names.js";
import { SURNAMES } from "./data/surnames.js";
import { splitName } from "./split.js";
import { hiraganaToKatakana, isKana } from "../text/kana.js";
import { normalizeKyujitai } from "../text/kyujitai.js";
import { normalizeWidth } from "../text/width.js";

/** Result of {@link nameToKana}. */
export interface NameKanaResult {
  /** Family name as given in the input (glyph variants preserved). */
  family: string;
  /** Given name as given in the input, or null when no split was found. */
  given: string | null;
  /** Estimated primary reading of the family name, or null when unknown. */
  familyKana: string | null;
  /** Estimated primary reading of the given name, or null when unknown. */
  givenKana: string | null;
  /**
   * Full estimated reading "FAMILY GIVEN" (space-separated katakana) when
   * both parts are known, otherwise null.
   */
  kana: string | null;
  /**
   * Alternative full readings when either part has more than one common
   * reading (e.g. 中島 -> ナカジマ / ナカシマ). Empty when unambiguous.
   */
  alternatives: string[];
  /**
   * Estimate quality in [0, 1]:
   * 1.0 input was already kana; 0.85 both parts in dictionary;
   * 0.5 one part in dictionary; 0 nothing matched.
   * Deduct 0.15 when the split itself came from the length heuristic.
   */
  confidence: number;
}

const SURNAME_READINGS = new Map<string, readonly string[]>(
  SURNAMES.map(([kanji, ...readings]) => [kanji, readings]),
);
const GIVEN_READINGS = new Map<string, readonly string[]>(
  GIVEN_NAMES.map(([kanji, ...readings]) => [kanji, readings]),
);

function lookupReadings(
  table: Map<string, readonly string[]>,
  part: string,
): readonly string[] | null {
  // Fold old-form glyph variants (渡邊 -> 渡辺) for matching only; the
  // original spelling is preserved in the result.
  const folded = normalizeKyujitai(part);
  return table.get(folded) ?? null;
}

/**
 * Estimate the katakana reading of a Japanese full name.
 *
 * Accepts "山田太郎", "山田 太郎", "渡邊　剛" and already-kana input such
 * as "やまだ たろう" (converted to katakana, confidence 1.0). Returns
 * null readings rather than guessing when a part is not in the built-in
 * dictionaries; see {@link NameKanaResult.confidence}.
 */
export function nameToKana(fullName: string): NameKanaResult {
  const cleaned = normalizeWidth(fullName);
  const split = splitName(cleaned);

  // Already-kana input: conversion is exact, not an estimate.
  if (cleaned.length > 0 && isKana(cleaned)) {
    const familyKana = hiraganaToKatakana(split.family);
    const givenKana = split.given === null ? null : hiraganaToKatakana(split.given);
    return {
      family: split.family,
      given: split.given,
      familyKana,
      givenKana,
      kana: givenKana === null ? familyKana : `${familyKana} ${givenKana}`,
      alternatives: [],
      confidence: 1.0,
    };
  }

  const familyReadings = lookupReadings(SURNAME_READINGS, split.family);
  const givenReadings =
    split.given === null ? null : lookupReadings(GIVEN_READINGS, split.given);

  const familyKana = familyReadings?.[0] ?? null;
  const givenKana = givenReadings?.[0] ?? null;

  let confidence = 0;
  if (familyKana !== null && givenKana !== null) confidence = 0.85;
  else if (familyKana !== null || givenKana !== null) confidence = 0.5;
  if (split.method === "heuristic" && confidence > 0) {
    confidence = Math.max(0, confidence - 0.15);
  }

  const alternatives: string[] = [];
  if (familyReadings && givenReadings) {
    for (const f of familyReadings) {
      for (const g of givenReadings) {
        if (f === familyKana && g === givenKana) continue;
        alternatives.push(`${f} ${g}`);
      }
    }
  }

  return {
    family: split.family,
    given: split.given,
    familyKana,
    givenKana,
    kana:
      familyKana !== null && givenKana !== null
        ? `${familyKana} ${givenKana}`
        : null,
    alternatives,
    confidence,
  };
}
