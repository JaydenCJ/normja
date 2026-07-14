import { describe, expect, it } from "vitest";
import { nameToKana, splitName } from "../src/index.js";

describe("splitName", () => {
  it("splits on explicit separators first", () => {
    expect(splitName("山田 太郎")).toEqual({
      family: "山田",
      given: "太郎",
      method: "separator",
    });
    expect(splitName("山田　太郎")).toMatchObject({ family: "山田", given: "太郎" });
    expect(splitName("山田・太郎")).toMatchObject({ family: "山田", given: "太郎" });
  });

  it("splits unseparated names via the surname dictionary", () => {
    expect(splitName("山田太郎")).toEqual({
      family: "山田",
      given: "太郎",
      method: "dictionary",
    });
    expect(splitName("佐々木健太")).toEqual({
      family: "佐々木",
      given: "健太",
      method: "dictionary",
    });
    expect(splitName("五十嵐大介")).toMatchObject({
      family: "五十嵐",
      given: "大介",
    });
  });

  it("matches surnames written with old glyph variants", () => {
    const r = splitName("渡邊剛");
    expect(r.family).toBe("渡邊"); // original glyphs preserved
    expect(r.given).toBe("剛");
    expect(r.method).toBe("dictionary");
  });

  it("falls back to the length heuristic and says so", () => {
    const r = splitName("蘇我入鹿");
    expect(r.method).toBe("heuristic");
    expect(r.family).toBe("蘇我");
    expect(r.given).toBe("入鹿");
  });

  it("declines to split what it cannot split", () => {
    expect(splitName("")).toEqual({ family: "", given: null, method: "none" });
    expect(splitName("寿限無寿限無五劫の擦り切れ").method).toBe("none");
  });
});

describe("nameToKana", () => {
  it("estimates readings when both parts are in the dictionaries", () => {
    const r = nameToKana("山田太郎");
    expect(r.kana).toBe("ヤマダ タロウ");
    expect(r.familyKana).toBe("ヤマダ");
    expect(r.givenKana).toBe("タロウ");
    expect(r.confidence).toBe(0.85);
  });

  it("folds glyph variants for lookup but preserves the input", () => {
    const r = nameToKana("渡邊太郎");
    expect(r.family).toBe("渡邊");
    expect(r.kana).toBe("ワタナベ タロウ");
  });

  it("lists alternative readings for ambiguous names", () => {
    const r = nameToKana("中島美咲");
    expect(r.kana).toBe("ナカジマ ミサキ");
    expect(r.alternatives).toContain("ナカシマ ミサキ");
  });

  it("returns partial results instead of guessing", () => {
    const r = nameToKana("山田源五郎");
    expect(r.familyKana).toBe("ヤマダ");
    expect(r.givenKana).toBeNull();
    expect(r.kana).toBeNull();
    expect(r.confidence).toBe(0.5);
  });

  it("passes through kana input with full confidence", () => {
    const r = nameToKana("やまだ たろう");
    expect(r.kana).toBe("ヤマダ タロウ");
    expect(r.confidence).toBe(1.0);
  });

  it("handles full-width space separated kanji names", () => {
    const r = nameToKana("鈴木　花子");
    expect(r.kana).toBe("スズキ ハナコ");
  });

  it("reports zero confidence when nothing matches", () => {
    const r = nameToKana("蘇我入鹿");
    expect(r.kana).toBeNull();
    expect(r.confidence).toBe(0);
  });
});
