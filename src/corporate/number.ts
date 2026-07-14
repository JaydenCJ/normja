/**
 * Corporate Number (法人番号) validation.
 *
 * A Corporate Number is 13 digits: one leading check digit followed by a
 * 12-digit body. The check digit algorithm is defined by Ministry of
 * Finance Ordinance No. 70 of 2015 (国税庁 法人番号の構成):
 *
 *   check = 9 - (sum(P_n * Q_n) mod 9)
 *
 * where P_n is the n-th digit of the 12-digit body counted from the last
 * digit (n = 1..12) and Q_n is 1 when n is odd, 2 when n is even.
 *
 * The qualified invoice issuer registration number (適格請求書発行事業者
 * 登録番号) is the letter "T" followed by the same 13 digits, so inputs in
 * that format are accepted and unwrapped.
 */

import { toHalfWidthAscii } from "../text/width.js";

/**
 * Compute the check digit for a 12-digit corporate number body.
 * Throws a RangeError when the input is not exactly 12 ASCII digits.
 */
export function corporateCheckDigit(body: string): number {
  if (!/^\d{12}$/.test(body)) {
    throw new RangeError(
      `corporateCheckDigit expects exactly 12 digits, got "${body}"`,
    );
  }
  let sum = 0;
  for (let n = 1; n <= 12; n++) {
    const digit = body.charCodeAt(12 - n) - 48;
    sum += digit * (n % 2 === 1 ? 1 : 2);
  }
  return 9 - (sum % 9);
}

/**
 * Normalize a corporate number found in free text to its canonical
 * 13-digit form.
 *
 * Accepts full-width digits, an optional invoice-format "T"/"Ｔ" prefix,
 * and hyphens or spaces between digit groups. Returns null when the input
 * cannot be a corporate number at all (wrong length or non-digits).
 * Note: this does NOT verify the check digit — use
 * {@link validateCorporateNumber} for that.
 */
export function normalizeCorporateNumber(input: string): string | null {
  let s = toHalfWidthAscii(input).trim();
  s = s.replace(/^[tT]/, "");
  s = s.replace(/[-\s]/g, "");
  return /^\d{13}$/.test(s) ? s : null;
}

/**
 * True when the input normalizes to 13 digits whose leading check digit
 * matches the official algorithm. Accepts the invoice "T" prefix and
 * full-width digits; any other malformed input returns false.
 */
export function validateCorporateNumber(input: string): boolean {
  const normalized = normalizeCorporateNumber(input);
  if (normalized === null) return false;
  const check = normalized.charCodeAt(0) - 48;
  return corporateCheckDigit(normalized.slice(1)) === check;
}
