/**
 * Hiragana/katakana conversion utilities.
 *
 * The two syllabaries occupy parallel Unicode blocks
 * (hiragana U+3041..U+3096, katakana U+30A1..U+30F6) with a fixed offset
 * of 0x60, which makes conversion a pure code point shift.
 */

/**
 * Convert hiragana to katakana. Other characters are left untouched.
 */
export function hiraganaToKatakana(input: string): string {
  return input.replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60),
  );
}

/**
 * Convert katakana to hiragana. Code points without a hiragana counterpart
 * (ヴ has one; ヵ/ヶ map to their small hiragana forms) are shifted where the
 * parallel block covers them, other characters are left untouched.
 */
export function katakanaToHiragana(input: string): string {
  return input.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

/**
 * True when the string consists only of kana (hiragana, katakana,
 * the prolonged sound mark and the middle dot) and optional spaces.
 */
export function isKana(input: string): boolean {
  return /^[ぁ-ゖァ-ヺー・ゝゞヽヾ\s]+$/.test(
    input,
  );
}
