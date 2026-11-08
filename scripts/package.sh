#!/usr/bin/env bash
# Builds a clean source zip for Hostinger's Node.js app hosting.
# Leaves out everything Hostinger regenerates (node_modules, .next) and
# anything private or local (.git, .env*.local, editor folders).
set -euo pipefail
cd "$(dirname "$0")/.."

if grep -q "your-domain.com" .env.production 2>/dev/null; then
  echo "⚠  .env.production still says https://your-domain.com — set your real domain before uploading."
fi

OUT="release/portfolio-upload.zip"
mkdir -p release
rm -f "$OUT"

zip -r -q -X "$OUT" . \
  -x "node_modules/*" ".next/*" "out/*" "release/*" ".git/*" ".claude/*" ".vscode/*" ".idea/*" \
  -x "*.zip" "*.DS_Store" "*.tsbuildinfo" "next-env.d.ts" "coverage/*" \
  -x ".env.local" ".env.*.local" "npm-debug.log*"

echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
echo "Contents:"
unzip -l "$OUT" | awk 'NR>3 {print "  " $4}' | grep -v '^  $' | sed '$d' | head -60
