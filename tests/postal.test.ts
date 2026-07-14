import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  PostalIndex,
  formatPostalCode,
  lookupPostalCode,
  normalizePostalCode,
  parseKenAllCsv,
  searchPostalCode,
  SAMPLE_POSTAL_RECORDS,
} from "../src/index.js";

function fixture(name: string): string {
  return readFileSync(
    fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)),
    "utf8",
  );
}

describe("normalizePostalCode / formatPostalCode", () => {
  it("strips 〒, full-width digits and dashes", () => {
    expect(normalizePostalCode("〒１００−０００５")).toBe("1000005");
    expect(normalizePostalCode("100-0005")).toBe("1000005");
    expect(normalizePostalCode("1000005")).toBe("1000005");
  });
  it("rejects wrong lengths and garbage", () => {
    expect(normalizePostalCode("100-005")).toBeNull();
    expect(normalizePostalCode("abcdefg")).toBeNull();
    expect(normalizePostalCode("")).toBeNull();
  });
  it("formats with the customary hyphen", () => {
    expect(formatPostalCode("〒1000005")).toBe("100-0005");
    expect(formatPostalCode("nope")).toBeNull();
  });
});

describe("lookupPostalCode (built-in sample data)", () => {
  it("finds Marunouchi by code in any accepted format", () => {
    const hits = lookupPostalCode("〒100-0005");
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({
      prefecture: "東京都",
      city: "千代田区",
      town: "丸の内",
    });
  });
  it("returns an empty array for unknown codes", () => {
    expect(lookupPostalCode("9999999")).toEqual([]);
  });
});

describe("searchPostalCode (reverse lookup)", () => {
  it("resolves a full address string to its postal code", () => {
    const hits = searchPostalCode("東京都千代田区丸の内1-9-1");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.record.code).toBe("1000005");
    expect(hits[0]?.score).toBe(2);
  });
  it("ranks the specific ward city above same-named wards elsewhere", () => {
    const hits = searchPostalCode("大阪市中央区難波");
    expect(hits[0]?.record.code).toBe("5420076");
  });
  it("respects a stated prefecture as a hard filter", () => {
    const hits = searchPostalCode("大阪府中央区");
    expect(hits.every((h) => h.record.prefecture === "大阪府")).toBe(true);
  });
  it("matches a town name alone", () => {
    const hits = searchPostalCode("みなとみらい");
    expect(hits[0]?.record.code).toBe("2200012");
  });
});

describe("parseKenAllCsv", () => {
  it("parses KEN_ALL-format rows into records", () => {
    const records = parseKenAllCsv(fixture("ken_all_sample.csv"));
    expect(records).toHaveLength(7);
    const marunouchi = records.find((r) => r.code === "1000005");
    expect(marunouchi).toMatchObject({
      jis: "13101",
      prefecture: "東京都",
      city: "千代田区",
      town: "丸の内",
      prefectureKana: "トウキョウト",
      cityKana: "チヨダク",
      townKana: "マルノウチ",
    });
  });

  it("turns catch-all pseudo towns into empty towns", () => {
    const records = parseKenAllCsv(fixture("ken_all_sample.csv"));
    const catchAll = records.find((r) => r.code === "0600000");
    expect(catchAll?.town).toBe("");
    expect(catchAll?.townKana).toBe("");
  });

  it("strips parenthesized chome ranges from town names", () => {
    const records = parseKenAllCsv(fixture("ken_all_sample.csv"));
    const odori = records.find((r) => r.code === "0640820");
    expect(odori?.town).toBe("大通西");
  });

  it("merges continuation rows split by an over-long town name", () => {
    const records = parseKenAllCsv(fixture("ken_all_multiline.csv"));
    expect(records).toHaveLength(2);
    expect(records[0]?.code).toBe("1006890");
    expect(records[0]?.town).toBe("丸の内丸の内ビルディング");
    expect(records[1]?.town).toBe("渋谷");
  });

  it("feeds converted records straight into a PostalIndex", () => {
    const idx = new PostalIndex(parseKenAllCsv(fixture("ken_all_sample.csv")));
    expect(idx.size).toBe(7);
    expect(idx.byCode("530-0001")[0]?.town).toBe("梅田");
    expect(idx.byAddress("北海道札幌市中央区大通西5丁目")[0]?.record.code).toBe(
      "0640820",
    );
  });
});

describe("sample dataset sanity", () => {
  it("has unique (code, town) pairs and well-formed fields", () => {
    const seen = new Set<string>();
    for (const r of SAMPLE_POSTAL_RECORDS) {
      expect(r.code).toMatch(/^\d{7}$/);
      expect(r.jis).toMatch(/^\d{5}$/);
      expect(r.prefecture).not.toBe("");
      expect(r.city).not.toBe("");
      const key = `${r.code}:${r.town}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});
