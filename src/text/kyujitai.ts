/**
 * Old-form kanji (kyujitai) and common glyph variants to modern form
 * (shinjitai) mapping.
 *
 * Scope is deliberately conservative: only pairs where the modern form is
 * the official form in the Joyo Kanji table (Cabinet notification, 2010
 * revision) or a well-known compatibility variant (hashigo-daka,
 * tatsu-saki), so the mapping is safe for address and company-name text.
 *
 * Pairs that are legally distinct in person or place names today are
 * intentionally excluded: for example 龍 (kept in place names such as
 * 天龍村) and 嶋/嶌 (distinct registered surnames) are NOT mapped.
 * Person-name matching inside this library folds variants internally but
 * never rewrites the name it returns.
 */

/** kyujitai / variant -> shinjitai. Each pair: old form of the modern Joyo character. */
export const KYUJITAI_MAP: Record<string, string> = {
  // Joyo shinjitai pairs (old form listed in the Joyo table's kyujitai column)
  "國": "国", // old form of 国 (country)
  "學": "学", // old form of 学 (study)
  "會": "会", // old form of 会 (meeting)
  "榮": "栄", // old form of 栄 (prosper)
  "澤": "沢", // old form of 沢 (marsh)
  "濱": "浜", // old form of 浜 (beach)
  "邊": "辺", // old form of 辺 (vicinity)
  "邉": "辺", // variant of 邊, same modern form
  "齊": "斉", // old form of 斉
  "齋": "斎", // old form of 斎
  "廣": "広", // old form of 広 (wide)
  "藏": "蔵", // old form of 蔵 (storehouse)
  "醫": "医", // old form of 医 (medicine)
  "體": "体", // old form of 体 (body)
  "縣": "県", // old form of 県 (prefecture) — frequent in pre-war addresses
  "圓": "円", // old form of 円 (yen/circle)
  "壽": "寿", // old form of 寿 (longevity)
  "惡": "悪", // old form of 悪 (evil)
  "應": "応", // old form of 応 (respond)
  "櫻": "桜", // old form of 桜 (cherry)
  "淺": "浅", // old form of 浅 (shallow)
  "眞": "真", // old form of 真 (true)
  "德": "徳", // variant of 徳 (virtue)
  "瀨": "瀬", // old form of 瀬 (rapids)
  "舊": "旧", // old form of 旧 (former)
  "萬": "万", // old form of 万 (ten thousand)
  "佛": "仏", // old form of 仏 (Buddha)
  "團": "団", // old form of 団 (group) — appears in company names
  "圖": "図", // old form of 図 (drawing)
  "寶": "宝", // old form of 宝 (treasure)
  "廳": "庁", // old form of 庁 (government office)
  "鐵": "鉄", // old form of 鉄 (iron) — appears in railway company names
  "拂": "払", // old form of 払 (pay)
  "澁": "渋", // old form of 渋 (astringent; 澁谷 -> 渋谷)
  "區": "区", // old form of 区 (ward) — frequent in pre-war addresses
  "驛": "駅", // old form of 駅 (station)
  "濟": "済", // old form of 済 (settle)
  "亙": "亘", // variant of 亘
  "檜": "桧", // variant of 桧 (cypress)
  // Compatibility/CJK variant forms extremely common in customer data
  "髙": "高", // hashigo-daka, variant of 高 (JIS X 0213 compatibility)
  "﨑": "崎", // tatsu-saki, variant of 崎 (JIS X 0213 compatibility)
  "濵": "浜", // variant of 濱, same modern form
};

const KYUJITAI_RE = new RegExp(
  `[${Object.keys(KYUJITAI_MAP).join("")}]`,
  "g",
);

/**
 * Replace old-form kanji (kyujitai) and common compatibility variants with
 * their modern (shinjitai) equivalents.
 *
 * Safe for addresses and organization names. For person names prefer
 * keeping the original glyphs; name lookup in this library folds variants
 * internally without rewriting your data.
 */
export function normalizeKyujitai(input: string): string {
  return input.replace(KYUJITAI_RE, (ch) => KYUJITAI_MAP[ch] ?? ch);
}
