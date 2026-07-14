import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { normalizeAddress, normalizeBlocks } from "../src/index.js";
import type { NormalizedAddress } from "../src/index.js";

interface AddressCase {
  note: string;
  input: string;
  expected: Omit<NormalizedAddress, never>;
}

const cases: AddressCase[] = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./fixtures/addresses.json", import.meta.url)),
    "utf8",
  ),
);

describe("normalizeAddress (real-world fixture table)", () => {
  for (const c of cases) {
    it(c.note, () => {
      const result = normalizeAddress(c.input);
      expect(result).toEqual(c.expected);
    });
  }
});

describe("normalizeAddress edge behavior", () => {
  it("strips enclosing brackets that LLMs like to add", () => {
    const r = normalizeAddress("「東京都渋谷区渋谷２丁目２１−１」");
    expect(r.normalized).toBe("東京都渋谷区渋谷2-21-1");
  });

  it("handles newlines inside the input", () => {
    const r = normalizeAddress("東京都千代田区\n丸の内1-9-1");
    expect(r.normalized).toBe("東京都千代田区丸の内1-9-1");
  });

  it("accepts a suffix-less prefecture (東京 for 東京都)", () => {
    const r = normalizeAddress("東京千代田区丸の内1-9-1");
    expect(r.prefecture).toBe("東京都");
    expect(r.city).toBe("千代田区");
  });

  it("flags a prefecture/city contradiction instead of silently accepting", () => {
    const r = normalizeAddress("大阪府千代田区丸の内1-9-1");
    expect(r.warnings).toContain("city-prefecture-mismatch");
  });

  it("returns warnings for totally unparseable input without throwing", () => {
    const r = normalizeAddress("This is not an address");
    expect(r.prefecture).toBeNull();
    expect(r.warnings).toContain("prefecture-missing");
    expect(r.warnings).toContain("city-not-found");
  });

  it("keeps 丁目 when nothing follows it", () => {
    const r = normalizeAddress("大阪府大阪市北区梅田三丁目");
    expect(r.area).toBe("梅田3丁目");
  });
});

describe("normalizeBlocks", () => {
  it("converts full kanji counter chains", () => {
    expect(normalizeBlocks("一丁目九番一号")).toBe("1-9-1");
  });
  it("converts compound kanji numerals (二十三番地)", () => {
    expect(normalizeBlocks("二十三番地")).toBe("23");
  });
  it("normalizes の connectors", () => {
    expect(normalizeBlocks("1の9の1")).toBe("1-9-1");
  });
  it("leaves room numbers alone (号室)", () => {
    expect(normalizeBlocks("2番3号 601号室")).toBe("2-3 601号室");
  });
  it("never rewrites 番町 town names", () => {
    expect(normalizeBlocks("一番町23")).toBe("一番町23");
    expect(normalizeBlocks("六番町1-2")).toBe("六番町1-2");
  });
});
