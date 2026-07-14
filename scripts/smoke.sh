#!/usr/bin/env bash
# Smoke test: build, pack, install the tarball into a scratch project and
# exercise the public API plus the normja-kenall CLI exactly like a user
# would. Prints SMOKE OK and exits 0 only when every assertion passes.
# Fully offline: the only install source is the locally packed tarball.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "[smoke] building"
cd "$ROOT"
npm run build --silent

echo "[smoke] packing"
TARBALL_NAME="$(npm pack --silent | tail -1)"
TARBALL="$ROOT/$TARBALL_NAME"

echo "[smoke] installing tarball into scratch project"
mkdir -p "$TMP/app"
cd "$TMP/app"
printf '{"name":"smoke-app","private":true,"type":"module"}\n' > package.json
npm install --no-audit --no-fund --silent "$TARBALL" > /dev/null

echo "[smoke] running API assertions"
cat > smoke.mjs <<'EOF'
import assert from "node:assert/strict";
import {
  normalizeAddress,
  lookupPostalCode,
  searchPostalCode,
  nameToKana,
  splitName,
  validateCorporateNumber,
  normalizeKyujitai,
  toFullWidthKana,
} from "normja";

// Address normalization: kanji numerals, widths, structure.
const addr = normalizeAddress("〒100-0005 東京都千代田区丸の内一丁目９番１号");
assert.equal(addr.normalized, "東京都千代田区丸の内1-9-1");
assert.equal(addr.postalCode, "1000005");
assert.equal(addr.city, "千代田区");

// Prefecture inference from a unique city.
const inferred = normalizeAddress("横浜市西区みなとみらい２丁目２−１");
assert.equal(inferred.prefecture, "神奈川県");
assert.deepEqual(inferred.warnings, ["prefecture-inferred"]);

// Postal forward + reverse lookup on the built-in sample data.
assert.equal(lookupPostalCode("〒100-0005")[0].town, "丸の内");
assert.equal(searchPostalCode("東京都千代田区丸の内1-9-1")[0].record.code, "1000005");

// Name splitting and kana estimation, glyph variants folded.
assert.equal(splitName("山田太郎").family, "山田");
assert.equal(nameToKana("渡邊太郎").kana, "ワタナベ タロウ");

// Corporate number check digit (National Tax Agency's own number).
assert.equal(validateCorporateNumber("7000012050002"), true);
assert.equal(validateCorporateNumber("8000012050002"), false);

// Text cleanup primitives.
assert.equal(normalizeKyujitai("東京都新宿區"), "東京都新宿区");
assert.equal(toFullWidthKana("ﾏﾙﾉｳﾁ"), "マルノウチ");

console.log("[smoke] api assertions passed");
EOF
node smoke.mjs

echo "[smoke] running CLI assertions"
./node_modules/.bin/normja-kenall "$ROOT/tests/fixtures/ken_all_sample.csv" > out.json 2> cli.log
node --input-type=module - <<'EOF'
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const records = JSON.parse(readFileSync("out.json", "utf8"));
assert.equal(records.length, 7);
assert.equal(records.find((r) => r.code === "1000005").town, "丸の内");
console.log("[smoke] cli assertions passed");
EOF

if ./node_modules/.bin/normja-kenall /definitely/missing.csv 2> /dev/null; then
  echo "[smoke] FAIL: CLI should exit non-zero on a missing file"
  exit 1
fi
echo "[smoke] cli error handling ok"

rm -f "$TARBALL"
echo "SMOKE OK"
