/**
 * Block-number notation normalization (丁目 / 番地 / 号).
 *
 * Real-world Japanese addresses write the same location many ways:
 * 1丁目9番1号 / 一丁目九番一号 / 1-9-1 / １ー９ー１ / 1の9の1.
 * The canonical form used by this library is the dash style "1-9-1",
 * which is the de-facto interchange format used by map services and the
 * dominant style in databases.
 *
 * Safety rules, in order of importance:
 * - kanji numerals are converted only when directly followed by a block
 *   counter (丁目/番/号), so proper nouns like 三軒茶屋 or 六本木 are
 *   never rewritten;
 * - 番 followed by 町 is never treated as a counter, protecting real town
 *   names such as 一番町 / 二番町 (Chiyoda-ku, Sendai, ...);
 * - 号 followed by 室/館/棟 is left alone (room/building numbers).
 */

import { KANJI_NUMERAL_CLASS, kanjiToNumber } from "../text/numbers.js";

const KANJI_NUM_BEFORE_COUNTER = new RegExp(
  // counter lookahead: 丁目, 番地, 番 (not 番町), or 号
  `([${KANJI_NUMERAL_CLASS}]+)(?=丁目|番地|番(?!町)|号)`,
  "g",
);

/** Dash-like characters that appear between digits in the wild. */
const DASH_VARIANTS_BETWEEN_DIGITS =
  /(?<=\d)[‐‑‒–—―−ーｰ~〜～](?=\d)/g;

/**
 * Normalize block-number notation inside an address fragment to the
 * canonical dash style. Assumes character widths are already normalized
 * (ASCII half-width). Examples:
 *
 * - "一丁目九番一号"   -> "1-9-1"
 * - "1丁目9番地1号"    -> "1-9-1"
 * - "２ー２－１"        -> "2-2-1" (after width normalization)
 * - "1の9の1"          -> "1-9-1"
 * - "三丁目"           -> "3丁目" (kept: nothing follows, suffix is informative)
 * - "一番町2"          -> "一番町2" (town name protected)
 */
export function normalizeBlocks(input: string): string {
  let s = input;

  // Kanji numerals in counter position -> Arabic digits.
  s = s.replace(KANJI_NUM_BEFORE_COUNTER, (m) => {
    const n = kanjiToNumber(m);
    return n === null ? m : String(n);
  });

  // Unify exotic dashes / prolonged sound marks / wave dashes between digits.
  s = s.replace(DASH_VARIANTS_BETWEEN_DIGITS, "-");

  // The connector の between digits: 1の9の1 -> 1-9-1.
  s = s.replace(/(\d+)\s*の\s*(?=\d)/g, "$1-");

  // 丁目 followed by another number joins with a dash: 1丁目9 -> 1-9.
  s = s.replace(/(\d+)\s*丁目\s*(?=\d)/g, "$1-");

  // 番 / 番地 followed by another number joins with a dash: 9番1, 9番地1.
  // 番町 is protected because the lookahead requires a digit.
  s = s.replace(/(\d+)\s*番地?\s*(?=\d)/g, "$1-");

  // Trailing 番地 with nothing after it drops the counter: 123番地 -> 123.
  s = s.replace(/(\d+)\s*番地(?=\D|$)/g, "$1");

  // Trailing 号 drops the counter, but 号室/号館/号棟 (rooms/buildings) stay.
  s = s.replace(/(\d+)\s*号(?![室館棟])/g, "$1");

  return s;
}
