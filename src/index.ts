/**
 * normja — Japanese data normalization toolkit.
 *
 * Addresses, postal codes, person names, corporate numbers and
 * width/glyph cleanup. Fully offline, zero runtime dependencies,
 * deterministic — built as a post-processing layer for LLM output
 * and other messy data sources.
 */

// Address normalization
export { normalizeAddress } from "./address/parse.js";
export type { NormalizedAddress, AddressWarning } from "./address/parse.js";
export { normalizeBlocks } from "./address/blocks.js";
export { PREFECTURES } from "./address/data/prefectures.js";
export type { Prefecture } from "./address/data/prefectures.js";

// Postal codes
export {
  PostalIndex,
  getDefaultPostalIndex,
  lookupPostalCode,
  searchPostalCode,
  normalizePostalCode,
  formatPostalCode,
} from "./postal/index.js";
export type { PostalSearchHit } from "./postal/index.js";
export type { PostalRecord } from "./postal/types.js";
export { parseKenAllCsv } from "./postal/kenall.js";
export { SAMPLE_POSTAL_RECORDS } from "./postal/data/sample-records.js";

// Person names
export { splitName } from "./name/split.js";
export type { SplitNameResult, SplitMethod } from "./name/split.js";
export { nameToKana } from "./name/kana.js";
export type { NameKanaResult } from "./name/kana.js";

// Corporate numbers
export {
  validateCorporateNumber,
  normalizeCorporateNumber,
  corporateCheckDigit,
} from "./corporate/number.js";

// Text utilities
export {
  toHalfWidthAscii,
  toFullWidthKana,
  normalizeWidth,
} from "./text/width.js";
export {
  hiraganaToKatakana,
  katakanaToHiragana,
  isKana,
} from "./text/kana.js";
export { normalizeKyujitai, KYUJITAI_MAP } from "./text/kyujitai.js";
export { kanjiToNumber } from "./text/numbers.js";
