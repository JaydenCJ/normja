/**
 * Kanji numeral parsing for address contexts.
 *
 * Japanese addresses write block numbers either in Arabic digits or kanji
 * numerals (一丁目 / 1丁目 / １丁目 all appear in real data). Conversion is
 * only applied by callers in positional contexts (before 丁目/番/号) so that
 * proper nouns containing numeral kanji (三軒茶屋, 一番町, 六本木) are never
 * rewritten.
 */

const DIGITS: Record<string, number> = {
  "〇": 0, "零": 0,
  "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
  "六": 6, "七": 7, "八": 8, "九": 9,
};

const MULTIPLIERS: Record<string, number> = {
  "十": 10,
  "百": 100,
  "千": 1000,
};

/** Characters that can appear in a kanji numeral handled by this module. */
export const KANJI_NUMERAL_CLASS = "〇零一二三四五六七八九十百千";

/**
 * Parse a kanji numeral string (positional or multiplicative style) into a
 * number. Supports values 0..9999, e.g. 三 -> 3, 十八 -> 18, 二十三 -> 23,
 * 一〇三 -> 103. Returns null for empty or malformed input.
 */
export function kanjiToNumber(input: string): number | null {
  if (input.length === 0) return null;
  // Positional style without multipliers, e.g. 一〇三 -> 103.
  if ([...input].every((ch) => ch in DIGITS)) {
    let value = 0;
    for (const ch of input) {
      value = value * 10 + (DIGITS[ch] as number);
    }
    return value;
  }
  // Multiplicative style, e.g. 二十三 -> 23, 千九百 -> 1900.
  let total = 0;
  let current = 0;
  for (const ch of input) {
    if (ch in DIGITS) {
      if (current !== 0) return null; // two digits in a row like 二三十 -> malformed here
      current = DIGITS[ch] as number;
    } else if (ch in MULTIPLIERS) {
      const mult = MULTIPLIERS[ch] as number;
      total += (current === 0 ? 1 : current) * mult;
      current = 0;
    } else {
      return null;
    }
  }
  return total + current;
}
