/**
 * This test mirrors the Quickstart example in README.md verbatim so the
 * documentation can never drift from actual behavior. If you change this
 * file, change the README (all three languages) in the same commit.
 */
import { describe, expect, it } from "vitest";
import {
  normalizeAddress,
  lookupPostalCode,
  nameToKana,
  validateCorporateNumber,
} from "../src/index.js";

describe("README Quickstart example", () => {
  it("produces exactly the output shown in the README", () => {
    expect(
      normalizeAddress("東京都千代田区丸の内一丁目９番１号").normalized,
    ).toBe("東京都千代田区丸の内1-9-1");
    expect(lookupPostalCode("〒100-0005")[0]?.town).toBe("丸の内");
    expect(nameToKana("渡邊太郎").kana).toBe("ワタナベ タロウ");
    expect(validateCorporateNumber("7000012050002")).toBe(true);
  });
});
