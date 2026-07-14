/**
 * Postal code record model.
 *
 * The shape mirrors one row of Japan Post's KEN_ALL data after cleanup:
 * one record per (postal code, town) pair. A single postal code can map to
 * several towns and vice versa, so every lookup returns an array.
 */

/** One postal-code/town entry. */
export interface PostalRecord {
  /** 7-digit postal code without hyphen, e.g. "1000005". */
  code: string;
  /** 5-digit JIS X 0402 municipality code, e.g. "13101". */
  jis: string;
  /** Prefecture name, e.g. 東京都. */
  prefecture: string;
  /** Municipality name, e.g. 千代田区 or 横浜市西区. */
  city: string;
  /**
   * Town/area name (町域), e.g. 丸の内. Empty string for catch-all rows
   * (KEN_ALL's 以下に掲載がない場合) that cover the whole municipality.
   */
  town: string;
  /** Katakana reading of the prefecture. */
  prefectureKana: string;
  /** Katakana reading of the municipality. */
  cityKana: string;
  /** Katakana reading of the town; empty for catch-all rows. */
  townKana: string;
}
