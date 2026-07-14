/**
 * Built-in sample postal code dataset.
 *
 * These are real, well-known postal codes for central districts of major
 * Japanese cities (Japan Post postal code system; the same values appear
 * in the KEN_ALL dataset). They exist so that the library works out of the
 * box for demos and tests WITHOUT shipping the full ~124,000-row dataset
 * inside the package.
 *
 * For production lookups, generate the full dataset from Japan Post's
 * utf_ken_all.csv with the bundled `normja-kenall` command and pass the
 * records to `new PostalIndex(records)`. See README "Full postal dataset".
 */

import type { PostalRecord } from "../types.js";

export const SAMPLE_POSTAL_RECORDS: readonly PostalRecord[] = [
  { code: "0600000", jis: "01101", prefecture: "北海道", city: "札幌市中央区", town: "", prefectureKana: "ホッカイドウ", cityKana: "サッポロシチュウオウク", townKana: "" },
  { code: "9800021", jis: "04101", prefecture: "宮城県", city: "仙台市青葉区", town: "中央", prefectureKana: "ミヤギケン", cityKana: "センダイシアオバク", townKana: "チュウオウ" },
  { code: "1000001", jis: "13101", prefecture: "東京都", city: "千代田区", town: "千代田", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "チヨダ" },
  { code: "1000004", jis: "13101", prefecture: "東京都", city: "千代田区", town: "大手町", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "オオテマチ" },
  { code: "1000005", jis: "13101", prefecture: "東京都", city: "千代田区", town: "丸の内", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "マルノウチ" },
  { code: "1000006", jis: "13101", prefecture: "東京都", city: "千代田区", town: "有楽町", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "ユウラクチョウ" },
  { code: "1000013", jis: "13101", prefecture: "東京都", city: "千代田区", town: "霞が関", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "カスミガセキ" },
  { code: "1000014", jis: "13101", prefecture: "東京都", city: "千代田区", town: "永田町", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "ナガタチョウ" },
  { code: "1010021", jis: "13101", prefecture: "東京都", city: "千代田区", town: "外神田", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "ソトカンダ" },
  { code: "1020082", jis: "13101", prefecture: "東京都", city: "千代田区", town: "一番町", prefectureKana: "トウキョウト", cityKana: "チヨダク", townKana: "イチバンチョウ" },
  { code: "1030027", jis: "13102", prefecture: "東京都", city: "中央区", town: "日本橋", prefectureKana: "トウキョウト", cityKana: "チュウオウク", townKana: "ニホンバシ" },
  { code: "1040061", jis: "13102", prefecture: "東京都", city: "中央区", town: "銀座", prefectureKana: "トウキョウト", cityKana: "チュウオウク", townKana: "ギンザ" },
  { code: "1050011", jis: "13103", prefecture: "東京都", city: "港区", town: "芝公園", prefectureKana: "トウキョウト", cityKana: "ミナトク", townKana: "シバコウエン" },
  { code: "1060032", jis: "13103", prefecture: "東京都", city: "港区", town: "六本木", prefectureKana: "トウキョウト", cityKana: "ミナトク", townKana: "ロッポンギ" },
  { code: "1070052", jis: "13103", prefecture: "東京都", city: "港区", town: "赤坂", prefectureKana: "トウキョウト", cityKana: "ミナトク", townKana: "アカサカ" },
  { code: "1600021", jis: "13104", prefecture: "東京都", city: "新宿区", town: "歌舞伎町", prefectureKana: "トウキョウト", cityKana: "シンジュクク", townKana: "カブキチョウ" },
  { code: "1600022", jis: "13104", prefecture: "東京都", city: "新宿区", town: "新宿", prefectureKana: "トウキョウト", cityKana: "シンジュクク", townKana: "シンジュク" },
  { code: "1600023", jis: "13104", prefecture: "東京都", city: "新宿区", town: "西新宿", prefectureKana: "トウキョウト", cityKana: "シンジュクク", townKana: "ニシシンジュク" },
  { code: "1110032", jis: "13106", prefecture: "東京都", city: "台東区", town: "浅草", prefectureKana: "トウキョウト", cityKana: "タイトウク", townKana: "アサクサ" },
  { code: "1310045", jis: "13107", prefecture: "東京都", city: "墨田区", town: "押上", prefectureKana: "トウキョウト", cityKana: "スミダク", townKana: "オシアゲ" },
  { code: "1500002", jis: "13113", prefecture: "東京都", city: "渋谷区", town: "渋谷", prefectureKana: "トウキョウト", cityKana: "シブヤク", townKana: "シブヤ" },
  { code: "1500043", jis: "13113", prefecture: "東京都", city: "渋谷区", town: "道玄坂", prefectureKana: "トウキョウト", cityKana: "シブヤク", townKana: "ドウゲンザカ" },
  { code: "2200012", jis: "14103", prefecture: "神奈川県", city: "横浜市西区", town: "みなとみらい", prefectureKana: "カナガワケン", cityKana: "ヨコハマシニシク", townKana: "ミナトミライ" },
  { code: "4500002", jis: "23105", prefecture: "愛知県", city: "名古屋市中村区", town: "名駅", prefectureKana: "アイチケン", cityKana: "ナゴヤシナカムラク", townKana: "メイエキ" },
  { code: "4600008", jis: "23106", prefecture: "愛知県", city: "名古屋市中区", town: "栄", prefectureKana: "アイチケン", cityKana: "ナゴヤシナカク", townKana: "サカエ" },
  { code: "5300001", jis: "27127", prefecture: "大阪府", city: "大阪市北区", town: "梅田", prefectureKana: "オオサカフ", cityKana: "オオサカシキタク", townKana: "ウメダ" },
  { code: "5420076", jis: "27128", prefecture: "大阪府", city: "大阪市中央区", town: "難波", prefectureKana: "オオサカフ", cityKana: "オオサカシチュウオウク", townKana: "ナンバ" },
  { code: "6500021", jis: "28110", prefecture: "兵庫県", city: "神戸市中央区", town: "三宮町", prefectureKana: "ヒョウゴケン", cityKana: "コウベシチュウオウク", townKana: "サンノミヤチョウ" },
  { code: "7300011", jis: "34101", prefecture: "広島県", city: "広島市中区", town: "基町", prefectureKana: "ヒロシマケン", cityKana: "ヒロシマシナカク", townKana: "モトマチ" },
  { code: "8100001", jis: "40133", prefecture: "福岡県", city: "福岡市中央区", town: "天神", prefectureKana: "フクオカケン", cityKana: "フクオカシチュウオウク", townKana: "テンジン" },
  { code: "9000015", jis: "47201", prefecture: "沖縄県", city: "那覇市", town: "久茂地", prefectureKana: "オキナワケン", cityKana: "ナハシ", townKana: "クモジ" },
] as const;
