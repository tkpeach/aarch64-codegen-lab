#!/usr/bin/env bash
# Run from the project root. Each input uses the same SelectionDAG pipeline.
set -eu
case "${1:-}" in
  4|5) input="experiments/day$1-add-imm.ll" ;;
  6) input=experiments/day6-multiply.ll ;;
  *) echo "Usage: bash experiments/replay-selection.sh {4|5|6}" >&2; exit 2 ;;
esac
out="evidence/day$1"
mkdir -p "$out"
llc_bin=${LLC:-llc}
"$llc_bin" --version > "$out/version.txt"
"$llc_bin" -mtriple=aarch64-unknown-linux-gnu -mcpu=generic -O2 \
  -global-isel=0 -fast-isel=0 -verify-machineinstrs -debug-pass=Structure \
  -print-after=aarch64-isel "$input" -o "$out/final.s" 2> "$out/selection.txt"
