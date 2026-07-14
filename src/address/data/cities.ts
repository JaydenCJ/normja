/**
 * City-to-prefecture dictionary used for two purposes:
 *
 * 1. inferring a missing prefecture when the input starts at city level
 *    (frequent in LLM-extracted addresses), and
 * 2. resolving city names that defeat the generic non-greedy
 *    `^(.+?[市区町村])` pattern (e.g. 四日市市, 廿日市市, 野々市市).
 *
 * Coverage: all 23 Tokyo special wards, all 20 government-ordinance
 * designated cities (政令指定都市), every prefectural capital, a set of
 * large well-known cities, and the known ambiguous pairs. City-prefecture
 * membership is stable public administrative fact (JIS X 0402 municipality
 * codes); this is a curated subset, not the full ~1,700 municipality list.
 *
 * Ambiguity: identically-named cities in different prefectures exist
 * (府中市 in Tokyo and Hiroshima, 伊達市 in Hokkaido and Fukushima).
 * They are listed with BOTH prefectures; inference refuses to pick one.
 */

/** city name -> prefecture names it belongs to (2 entries = ambiguous). */
export const CITY_TO_PREFECTURE: Record<string, readonly string[]> = {
  // Tokyo special wards (特別区)
  "千代田区": ["東京都"],
  "中央区": ["東京都"], // also a ward name inside several designated cities; see parse.ts
  "港区": ["東京都"], // same caveat as 中央区 (大阪市港区 exists)
  "新宿区": ["東京都"],
  "文京区": ["東京都"],
  "台東区": ["東京都"],
  "墨田区": ["東京都"],
  "江東区": ["東京都"],
  "品川区": ["東京都"],
  "目黒区": ["東京都"],
  "大田区": ["東京都"],
  "世田谷区": ["東京都"],
  "渋谷区": ["東京都"],
  "中野区": ["東京都"],
  "杉並区": ["東京都"],
  "豊島区": ["東京都"],
  "北区": ["東京都"], // 大阪市北区 etc. exist; ward-level dedup handled in parse.ts
  "荒川区": ["東京都"],
  "板橋区": ["東京都"],
  "練馬区": ["東京都"],
  "足立区": ["東京都"],
  "葛飾区": ["東京都"],
  "江戸川区": ["東京都"],
  // Government-ordinance designated cities (政令指定都市)
  "札幌市": ["北海道"],
  "仙台市": ["宮城県"],
  "さいたま市": ["埼玉県"],
  "千葉市": ["千葉県"],
  "横浜市": ["神奈川県"],
  "川崎市": ["神奈川県"],
  "相模原市": ["神奈川県"],
  "新潟市": ["新潟県"],
  "静岡市": ["静岡県"],
  "浜松市": ["静岡県"],
  "名古屋市": ["愛知県"],
  "京都市": ["京都府"],
  "大阪市": ["大阪府"],
  "堺市": ["大阪府"],
  "神戸市": ["兵庫県"],
  "岡山市": ["岡山県"],
  "広島市": ["広島県"],
  "北九州市": ["福岡県"],
  "福岡市": ["福岡県"],
  "熊本市": ["熊本県"],
  // Prefectural capitals not already listed above
  "青森市": ["青森県"],
  "盛岡市": ["岩手県"],
  "秋田市": ["秋田県"],
  "山形市": ["山形県"],
  "福島市": ["福島県"],
  "水戸市": ["茨城県"],
  "宇都宮市": ["栃木県"],
  "前橋市": ["群馬県"],
  "富山市": ["富山県"],
  "金沢市": ["石川県"],
  "福井市": ["福井県"],
  "甲府市": ["山梨県"],
  "長野市": ["長野県"],
  "岐阜市": ["岐阜県"],
  "津市": ["三重県"],
  "大津市": ["滋賀県"],
  "奈良市": ["奈良県"],
  "和歌山市": ["和歌山県"],
  "鳥取市": ["鳥取県"],
  "松江市": ["島根県"],
  "山口市": ["山口県"],
  "徳島市": ["徳島県"],
  "高松市": ["香川県"],
  "松山市": ["愛媛県"],
  "高知市": ["高知県"],
  "佐賀市": ["佐賀県"],
  "長崎市": ["長崎県"],
  "大分市": ["大分県"],
  "宮崎市": ["宮崎県"],
  "鹿児島市": ["鹿児島県"],
  "那覇市": ["沖縄県"],
  // Large well-known cities
  "旭川市": ["北海道"],
  "函館市": ["北海道"],
  "郡山市": ["福島県"],
  "いわき市": ["福島県"],
  "高崎市": ["群馬県"],
  "川越市": ["埼玉県"],
  "川口市": ["埼玉県"],
  "越谷市": ["埼玉県"],
  "船橋市": ["千葉県"],
  "松戸市": ["千葉県"],
  "市川市": ["千葉県"],
  "柏市": ["千葉県"],
  "八王子市": ["東京都"],
  "町田市": ["東京都"],
  "横須賀市": ["神奈川県"],
  "藤沢市": ["神奈川県"],
  "長岡市": ["新潟県"],
  "沼津市": ["静岡県"],
  "豊田市": ["愛知県"],
  "岡崎市": ["愛知県"],
  "一宮市": ["愛知県"],
  "豊橋市": ["愛知県"],
  "姫路市": ["兵庫県"],
  "西宮市": ["兵庫県"],
  "尼崎市": ["兵庫県"],
  "倉敷市": ["岡山県"],
  "福山市": ["広島県"],
  "下関市": ["山口県"],
  "久留米市": ["福岡県"],
  "佐世保市": ["長崎県"],
  // Cities that defeat the non-greedy city pattern (name ends in 市市 or
  // contains 市 before the suffix)
  "四日市市": ["三重県"],
  "廿日市市": ["広島県"],
  "野々市市": ["石川県"],
  // Known ambiguous pairs: never used for prefecture inference
  "府中市": ["東京都", "広島県"],
  "伊達市": ["北海道", "福島県"],
};

/**
 * Designated cities whose addresses continue with an administrative ward
 * (政令指定都市). Used to attach "〜区" to the city segment,
 * e.g. 横浜市西区.
 */
export const DESIGNATED_CITIES: ReadonlySet<string> = new Set(
  [
    "札幌市", "仙台市", "さいたま市", "千葉市", "横浜市", "川崎市",
    "相模原市", "新潟市", "静岡市", "浜松市", "名古屋市", "京都市",
    "大阪市", "堺市", "神戸市", "岡山市", "広島市", "北九州市",
    "福岡市", "熊本市",
  ],
);
