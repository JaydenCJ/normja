import { describe, expect, it } from "vitest";
import {
  hiraganaToKatakana,
  isKana,
  kanjiToNumber,
  katakanaToHiragana,
  normalizeKyujitai,
  normalizeWidth,
  toFullWidthKana,
  toHalfWidthAscii,
} from "../src/index.js";

describe("toHalfWidthAscii", () => {
  it("converts full-width ASCII and the ideographic space", () => {
    expect(toHalfWidthAscii("ＡＢＣ　ｘｙｚ　１２３！")).toBe("ABC xyz 123!");
  });
  it("leaves kana and kanji untouched", () => {
    expect(toHalfWidthAscii("東京タワー")).toBe("東京タワー");
  });
});

describe("toFullWidthKana", () => {
  it("converts half-width katakana with sound marks", () => {
    expect(toFullWidthKana("ﾃﾞｼﾞﾀﾙ")).toBe("デジタル");
    expect(toFullWidthKana("ﾊﾟｽﾜｰﾄﾞ")).toBe("パスワード");
    expect(toFullWidthKana("ｳﾞｨﾝﾃｰｼﾞ")).toBe("ヴィンテージ");
  });
  it("converts half-width punctuation kana", () => {
    expect(toFullWidthKana("ﾄｳｷｮｳ･ﾏﾙﾉｳﾁ")).toBe("トウキョウ・マルノウチ");
  });
});

describe("normalizeWidth", () => {
  it("applies the canonical form and collapses spaces", () => {
    expect(normalizeWidth("  ｷﾑﾗ  Ｔａｒｏ　１２３  ")).toBe("キムラ Taro 123");
  });
});

describe("kana conversion", () => {
  it("round-trips hiragana and katakana", () => {
    expect(hiraganaToKatakana("やまだたろう")).toBe("ヤマダタロウ");
    expect(katakanaToHiragana("ヤマダタロウ")).toBe("やまだたろう");
  });
  it("detects kana-only strings", () => {
    expect(isKana("やまだ タロウ")).toBe(true);
    expect(isKana("山田")).toBe(false);
  });
});

describe("normalizeKyujitai", () => {
  it("maps old forms and compatibility variants to modern forms", () => {
    expect(normalizeKyujitai("廣澤髙﨑")).toBe("広沢高崎");
    expect(normalizeKyujitai("東京都新宿區")).toBe("東京都新宿区");
    expect(normalizeKyujitai("株式會社國際圖書")).toBe("株式会社国際図書");
  });
  it("does not touch legally distinct glyphs like 龍 or 嶋", () => {
    expect(normalizeKyujitai("天龍村")).toBe("天龍村");
    expect(normalizeKyujitai("中嶋")).toBe("中嶋");
  });
});

describe("kanjiToNumber", () => {
  it("parses simple and compound numerals", () => {
    expect(kanjiToNumber("三")).toBe(3);
    expect(kanjiToNumber("十八")).toBe(18);
    expect(kanjiToNumber("二十三")).toBe(23);
    expect(kanjiToNumber("百二十")).toBe(120);
    expect(kanjiToNumber("千九百")).toBe(1900);
  });
  it("parses positional style", () => {
    expect(kanjiToNumber("一〇三")).toBe(103);
  });
  it("rejects malformed input", () => {
    expect(kanjiToNumber("")).toBeNull();
    expect(kanjiToNumber("番")).toBeNull();
  });
});
