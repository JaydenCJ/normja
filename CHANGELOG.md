# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-07-08

### Added

- Fault-tolerant address normalization `normalizeAddress`: width and old
  glyph cleanup, kanji block numerals, 丁目/番地/号 canonicalization, label
  prefix stripping, postal code extraction, prefecture inference from a
  unique city, structured warnings.
- Bidirectional postal code lookup: `PostalIndex`, `lookupPostalCode`,
  `searchPostalCode`, `normalizePostalCode`, `formatPostalCode`, with a
  31-record built-in sample dataset.
- KEN_ALL converter `parseKenAllCsv` and the `normja-kenall` CLI:
  continuation-row merging, catch-all pseudo towns, parenthetical
  stripping, half-width kana conversion.
- Person name utilities: `splitName` (separator / dictionary / heuristic
  tiers) and `nameToKana` with confidence scores and alternative readings.
- Corporate number validation: `validateCorporateNumber`,
  `normalizeCorporateNumber`, `corporateCheckDigit` (official check-digit
  algorithm, invoice "T" prefix accepted).
- Text primitives: `toHalfWidthAscii`, `toFullWidthKana`, `normalizeWidth`,
  `hiraganaToKatakana`, `katakanaToHiragana`, `isKana`,
  `normalizeKyujitai`, `kanjiToNumber`.
- 74 tests including real-world-format address and KEN_ALL fixtures;
  tarball-based smoke script; trilingual README (en/zh/ja).
