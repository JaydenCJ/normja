/**
 * Person name splitting (family name / given name).
 *
 * Japanese full names are usually written family-name-first without a
 * separator, so splitting requires either an explicit separator (space,
 * ideographic space or middle dot) or dictionary knowledge of surnames.
 */

import { SURNAMES } from "./data/surnames.js";
import { normalizeKyujitai } from "../text/kyujitai.js";
import { normalizeWidth } from "../text/width.js";

/** How a name was split. */
export type SplitMethod = "separator" | "dictionary" | "heuristic" | "none";

/** Result of {@link splitName}. */
export interface SplitNameResult {
  /** Family name part; the full input when no split point was found. */
  family: string;
  /** Given name part, or null when no split point was found. */
  given: string | null;
  /** Strategy that produced the split. */
  method: SplitMethod;
}

/** Longest-first surname list with glyph variants folded for matching. */
const SURNAMES_BY_LENGTH = [...SURNAMES]
  .map(([kanji]) => kanji)
  .sort((a, b) => b.length - a.length);

/**
 * Split a Japanese full name into family and given parts.
 *
 * Strategy, in order:
 * 1. explicit separator (space / ideographic space / middle dot),
 * 2. longest-prefix match against the built-in surname dictionary
 *    (old-form glyph variants like 邊/髙 are folded before matching),
 * 3. length heuristic (2 chars -> 1+1, 3 -> 2+1, 4 -> 2+2, 5 -> 2+3),
 *    since two-character surnames are by far the most common.
 *
 * The heuristic tier is a guess; check `method` before trusting it.
 */
export function splitName(fullName: string): SplitNameResult {
  const cleaned = normalizeWidth(fullName).replace(/[・･]/g, " ").trim();
  if (cleaned.length === 0) {
    return { family: "", given: null, method: "none" };
  }

  const bySeparator = cleaned.split(/\s+/);
  if (bySeparator.length >= 2) {
    return {
      family: bySeparator[0] as string,
      given: bySeparator.slice(1).join(" "),
      method: "separator",
    };
  }

  const folded = normalizeKyujitai(cleaned);
  for (const surname of SURNAMES_BY_LENGTH) {
    if (folded.startsWith(surname) && cleaned.length > surname.length) {
      return {
        family: cleaned.slice(0, surname.length),
        given: cleaned.slice(surname.length),
        method: "dictionary",
      };
    }
  }

  const n = cleaned.length;
  if (n >= 2 && n <= 5) {
    const familyLen = n === 2 ? 1 : 2;
    return {
      family: cleaned.slice(0, familyLen),
      given: cleaned.slice(familyLen),
      method: "heuristic",
    };
  }

  return { family: cleaned, given: null, method: "none" };
}
