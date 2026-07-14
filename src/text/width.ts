/**
 * Character width normalization utilities.
 *
 * Japanese text in the wild (and especially in LLM output) freely mixes
 * full-width ASCII (U+FF01..U+FF5E), half-width katakana (U+FF61..U+FF9F)
 * and regular characters. The canonical form used across this library is:
 * ASCII/digits half-width, kana full-width. This matches the JIS X 0208
 * convention used by government registries such as the Corporate Number
 * Publication Site and the Address Base Registry.
 */

/** Half-width katakana to full-width katakana, base forms (JIS X 0201 -> JIS X 0208). */
const HALF_TO_FULL_KANA: Record<string, string> = {
  "ｦ": "ヲ", "ｧ": "ァ", "ｨ": "ィ", "ｩ": "ゥ", "ｪ": "ェ", "ｫ": "ォ",
  "ｬ": "ャ", "ｭ": "ュ", "ｮ": "ョ", "ｯ": "ッ", "ｰ": "ー", "ｱ": "ア",
  "ｲ": "イ", "ｳ": "ウ", "ｴ": "エ", "ｵ": "オ", "ｶ": "カ", "ｷ": "キ",
  "ｸ": "ク", "ｹ": "ケ", "ｺ": "コ", "ｻ": "サ", "ｼ": "シ", "ｽ": "ス",
  "ｾ": "セ", "ｿ": "ソ", "ﾀ": "タ", "ﾁ": "チ", "ﾂ": "ツ", "ﾃ": "テ",
  "ﾄ": "ト", "ﾅ": "ナ", "ﾆ": "ニ", "ﾇ": "ヌ", "ﾈ": "ネ", "ﾉ": "ノ",
  "ﾊ": "ハ", "ﾋ": "ヒ", "ﾌ": "フ", "ﾍ": "ヘ", "ﾎ": "ホ", "ﾏ": "マ",
  "ﾐ": "ミ", "ﾑ": "ム", "ﾒ": "メ", "ﾓ": "モ", "ﾔ": "ヤ", "ﾕ": "ユ",
  "ﾖ": "ヨ", "ﾗ": "ラ", "ﾘ": "リ", "ﾙ": "ル", "ﾚ": "レ", "ﾛ": "ロ",
  "ﾜ": "ワ", "ﾝ": "ン", "｡": "。", "､": "、", "｢": "「", "｣": "」",
  "･": "・",
};

/** Half-width kana that combine with a voiced sound mark (dakuten). */
const DAKUTEN_COMBINABLE: Record<string, string> = {
  "ｶ": "ガ", "ｷ": "ギ", "ｸ": "グ", "ｹ": "ゲ", "ｺ": "ゴ",
  "ｻ": "ザ", "ｼ": "ジ", "ｽ": "ズ", "ｾ": "ゼ", "ｿ": "ゾ",
  "ﾀ": "ダ", "ﾁ": "ヂ", "ﾂ": "ヅ", "ﾃ": "デ", "ﾄ": "ド",
  "ﾊ": "バ", "ﾋ": "ビ", "ﾌ": "ブ", "ﾍ": "ベ", "ﾎ": "ボ",
  "ｳ": "ヴ",
};

/** Half-width kana that combine with a semi-voiced sound mark (handakuten). */
const HANDAKUTEN_COMBINABLE: Record<string, string> = {
  "ﾊ": "パ", "ﾋ": "ピ", "ﾌ": "プ", "ﾍ": "ペ", "ﾎ": "ポ",
};

/**
 * Convert full-width ASCII letters, digits and punctuation (U+FF01..U+FF5E)
 * to their half-width equivalents, and the ideographic space (U+3000) to a
 * regular space.
 *
 * Kana and kanji are left untouched.
 */
export function toHalfWidthAscii(input: string): string {
  return input
    .replace(/[！-～]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
    )
    .replace(/　/g, " ");
}

/**
 * Convert half-width katakana (U+FF61..U+FF9F) to full-width katakana,
 * merging voiced/semi-voiced sound marks into precomposed characters
 * (e.g. "ｶﾞ" becomes "ガ").
 *
 * All other characters are left untouched.
 */
export function toFullWidthKana(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i] as string;
    const next = input[i + 1];
    if (next === "ﾞ" && DAKUTEN_COMBINABLE[ch]) {
      out += DAKUTEN_COMBINABLE[ch];
      i++;
      continue;
    }
    if (next === "ﾟ" && HANDAKUTEN_COMBINABLE[ch]) {
      out += HANDAKUTEN_COMBINABLE[ch];
      i++;
      continue;
    }
    if (HALF_TO_FULL_KANA[ch]) {
      out += HALF_TO_FULL_KANA[ch];
      continue;
    }
    // Stray sound marks that could not be combined become full-width marks.
    if (ch === "ﾞ") {
      out += "゛";
      continue;
    }
    if (ch === "ﾟ") {
      out += "゜";
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Apply the library-wide canonical width form:
 * half-width ASCII/digits, full-width kana, collapsed whitespace.
 */
export function normalizeWidth(input: string): string {
  return toFullWidthKana(toHalfWidthAscii(input)).replace(/[ \t]+/g, " ").trim();
}
