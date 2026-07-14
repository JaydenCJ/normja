/**
 * The 47 prefectures of Japan, in JIS X 0401 code order.
 *
 * Source: JIS X 0401 prefecture code table (used unchanged by the Digital
 * Agency Address Base Registry and Japan Post KEN_ALL data). This set is
 * closed and stable, so it is embedded as a complete authoritative list.
 */

/** One prefecture entry. */
export interface Prefecture {
  /** Two-digit JIS X 0401 code, "01".."47". */
  code: string;
  /** Official name including suffix, e.g. 東京都. */
  name: string;
  /** Name without the 都/道/府/県 suffix, e.g. 東京. */
  short: string;
  /** Katakana reading of the full name. */
  kana: string;
}

export const PREFECTURES: readonly Prefecture[] = [
  { code: "01", name: "北海道", short: "北海道", kana: "ホッカイドウ" },
  { code: "02", name: "青森県", short: "青森", kana: "アオモリケン" },
  { code: "03", name: "岩手県", short: "岩手", kana: "イワテケン" },
  { code: "04", name: "宮城県", short: "宮城", kana: "ミヤギケン" },
  { code: "05", name: "秋田県", short: "秋田", kana: "アキタケン" },
  { code: "06", name: "山形県", short: "山形", kana: "ヤマガタケン" },
  { code: "07", name: "福島県", short: "福島", kana: "フクシマケン" },
  { code: "08", name: "茨城県", short: "茨城", kana: "イバラキケン" },
  { code: "09", name: "栃木県", short: "栃木", kana: "トチギケン" },
  { code: "10", name: "群馬県", short: "群馬", kana: "グンマケン" },
  { code: "11", name: "埼玉県", short: "埼玉", kana: "サイタマケン" },
  { code: "12", name: "千葉県", short: "千葉", kana: "チバケン" },
  { code: "13", name: "東京都", short: "東京", kana: "トウキョウト" },
  { code: "14", name: "神奈川県", short: "神奈川", kana: "カナガワケン" },
  { code: "15", name: "新潟県", short: "新潟", kana: "ニイガタケン" },
  { code: "16", name: "富山県", short: "富山", kana: "トヤマケン" },
  { code: "17", name: "石川県", short: "石川", kana: "イシカワケン" },
  { code: "18", name: "福井県", short: "福井", kana: "フクイケン" },
  { code: "19", name: "山梨県", short: "山梨", kana: "ヤマナシケン" },
  { code: "20", name: "長野県", short: "長野", kana: "ナガノケン" },
  { code: "21", name: "岐阜県", short: "岐阜", kana: "ギフケン" },
  { code: "22", name: "静岡県", short: "静岡", kana: "シズオカケン" },
  { code: "23", name: "愛知県", short: "愛知", kana: "アイチケン" },
  { code: "24", name: "三重県", short: "三重", kana: "ミエケン" },
  { code: "25", name: "滋賀県", short: "滋賀", kana: "シガケン" },
  { code: "26", name: "京都府", short: "京都", kana: "キョウトフ" },
  { code: "27", name: "大阪府", short: "大阪", kana: "オオサカフ" },
  { code: "28", name: "兵庫県", short: "兵庫", kana: "ヒョウゴケン" },
  { code: "29", name: "奈良県", short: "奈良", kana: "ナラケン" },
  { code: "30", name: "和歌山県", short: "和歌山", kana: "ワカヤマケン" },
  { code: "31", name: "鳥取県", short: "鳥取", kana: "トットリケン" },
  { code: "32", name: "島根県", short: "島根", kana: "シマネケン" },
  { code: "33", name: "岡山県", short: "岡山", kana: "オカヤマケン" },
  { code: "34", name: "広島県", short: "広島", kana: "ヒロシマケン" },
  { code: "35", name: "山口県", short: "山口", kana: "ヤマグチケン" },
  { code: "36", name: "徳島県", short: "徳島", kana: "トクシマケン" },
  { code: "37", name: "香川県", short: "香川", kana: "カガワケン" },
  { code: "38", name: "愛媛県", short: "愛媛", kana: "エヒメケン" },
  { code: "39", name: "高知県", short: "高知", kana: "コウチケン" },
  { code: "40", name: "福岡県", short: "福岡", kana: "フクオカケン" },
  { code: "41", name: "佐賀県", short: "佐賀", kana: "サガケン" },
  { code: "42", name: "長崎県", short: "長崎", kana: "ナガサキケン" },
  { code: "43", name: "熊本県", short: "熊本", kana: "クマモトケン" },
  { code: "44", name: "大分県", short: "大分", kana: "オオイタケン" },
  { code: "45", name: "宮崎県", short: "宮崎", kana: "ミヤザキケン" },
  { code: "46", name: "鹿児島県", short: "鹿児島", kana: "カゴシマケン" },
  { code: "47", name: "沖縄県", short: "沖縄", kana: "オキナワケン" },
] as const;
