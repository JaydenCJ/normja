# Contributing to normja

Thanks for considering a contribution. This project treats its dictionaries
and rules as its core asset, so contributions to data quality are just as
valuable as code.

## Development setup

```bash
# from the root of your checkout
npm install
npm run build   # compile TypeScript to dist/
npm test        # run the vitest suite
bash scripts/smoke.sh   # end-to-end check against the packed tarball
```

Node.js 18 or newer is required. The library has zero runtime dependencies;
please keep it that way — new runtime dependencies need a very strong case.

## Ground rules

- **Every rule needs a source.** Dictionary entries and normalization rules
  must carry an English comment explaining their basis (Joyo Kanji table,
  JIS X 0401/0402, Japan Post data notes, ministry ordinances, and so on).
- **Every rule needs a fixture.** Add a real-world-format test case for any
  parsing or normalization change. Regressions in this domain are silent,
  so table-driven fixtures in `tests/fixtures/` are the safety net.
- **No wrong guesses.** When the input is ambiguous, return `null`, a
  lowered confidence, or a warning — never a plausible-looking fabrication.
- **English comments only** in source code; user-facing data (place names,
  readings) stays in Japanese.
- **Offline forever.** No network calls at import or runtime, no telemetry.

## Pull requests

1. Fork, create a branch, make your change with tests.
2. Run `npm test` and `bash scripts/smoke.sh` locally; both must pass.
3. Update all three README files (`README.md`, `README.zh.md`,
   `README.ja.md`) together when documentation changes.
4. Open a PR describing what changed and why; link an issue when one exists.

Bug reports with a failing input string are extremely welcome — real-world
address and name samples (anonymized) are the most useful thing you can send.
