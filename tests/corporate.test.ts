import { describe, expect, it } from "vitest";
import {
  corporateCheckDigit,
  normalizeCorporateNumber,
  validateCorporateNumber,
} from "../src/index.js";

describe("corporateCheckDigit", () => {
  it("computes the check digit of the NTA's own corporate number", () => {
    // 7000012050002 is the published corporate number of the National Tax
    // Agency; its body is 000012050002 and its check digit is 7.
    expect(corporateCheckDigit("000012050002")).toBe(7);
  });
  it("throws on anything that is not 12 digits", () => {
    expect(() => corporateCheckDigit("123")).toThrow(RangeError);
    expect(() => corporateCheckDigit("00001205000a")).toThrow(RangeError);
  });
});

describe("validateCorporateNumber", () => {
  it("accepts real corporate numbers", () => {
    expect(validateCorporateNumber("7000012050002")).toBe(true); // 国税庁
    expect(validateCorporateNumber("1180301018771")).toBe(true); // トヨタ自動車
    expect(validateCorporateNumber("5010401067252")).toBe(true); // ソニーグループ
  });
  it("accepts the invoice registration format (T prefix)", () => {
    expect(validateCorporateNumber("T7000012050002")).toBe(true);
  });
  it("accepts full-width digits and grouping", () => {
    expect(validateCorporateNumber("７００００１２０５０００２")).toBe(true);
    expect(validateCorporateNumber("7-0000-1205-0002")).toBe(true);
  });
  it("rejects a flipped check digit", () => {
    expect(validateCorporateNumber("8000012050002")).toBe(false);
  });
  it("rejects wrong lengths and non-numbers", () => {
    expect(validateCorporateNumber("000012050002")).toBe(false);
    expect(validateCorporateNumber("")).toBe(false);
    expect(validateCorporateNumber("thirteen chars")).toBe(false);
  });
});

describe("normalizeCorporateNumber", () => {
  it("normalizes without validating the check digit", () => {
    expect(normalizeCorporateNumber("T7000012050002")).toBe("7000012050002");
    expect(normalizeCorporateNumber("８000012050002")).toBe("8000012050002");
    expect(normalizeCorporateNumber("12345")).toBeNull();
  });
});
