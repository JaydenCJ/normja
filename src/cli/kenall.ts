#!/usr/bin/env node
/**
 * normja-kenall — convert Japan Post KEN_ALL CSV data (utf_ken_all.csv)
 * into the JSON record format consumed by `new PostalIndex(records)`.
 *
 * Usage:
 *   normja-kenall <utf_ken_all.csv> [--pretty] > postal.json
 *   cat utf_ken_all.csv | normja-kenall - > postal.json
 *
 * The conversion is fully offline: download utf_ken_all.zip from the
 * Japan Post postal code download page yourself, unzip it, then run this
 * command on the CSV. Exit code is 0 on success, 1 on any error.
 */

import { readFileSync } from "node:fs";
import process from "node:process";
import { parseKenAllCsv } from "../postal/kenall.js";

function usage(): string {
  return [
    "Usage: normja-kenall <utf_ken_all.csv> [--pretty]",
    "       normja-kenall - [--pretty]   (read CSV from stdin)",
    "",
    "Converts Japan Post KEN_ALL CSV data to normja PostalRecord JSON",
    "on stdout. The record count is reported on stderr.",
  ].join("\n");
}

function main(): number {
  const args = process.argv.slice(2);
  const pretty = args.includes("--pretty");
  const positional = args.filter((a) => a !== "--pretty");

  if (positional.includes("--help") || positional.includes("-h")) {
    process.stdout.write(usage() + "\n");
    return 0;
  }
  if (positional.length !== 1) {
    process.stderr.write(usage() + "\n");
    return 1;
  }

  const source = positional[0] as string;
  let csvText: string;
  try {
    csvText = source === "-"
      ? readFileSync(0, "utf8")
      : readFileSync(source, "utf8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`normja-kenall: cannot read ${source}: ${message}\n`);
    return 1;
  }

  const records = parseKenAllCsv(csvText);
  if (records.length === 0) {
    process.stderr.write(
      "normja-kenall: no records parsed — is this a KEN_ALL-format CSV?\n",
    );
    return 1;
  }

  process.stdout.write(
    JSON.stringify(records, null, pretty ? 2 : undefined) + "\n",
  );
  process.stderr.write(`normja-kenall: ${records.length} records\n`);
  return 0;
}

process.exit(main());
