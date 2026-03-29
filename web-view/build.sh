#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/../totals.html"

{
  printf '<!doctype html>\n<html lang="en">\n<head>\n'
  printf '  <meta charset="UTF-8" />\n'
  printf '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />\n'
  printf '  <meta name="apple-mobile-web-app-capable" content="yes" />\n'
  printf '  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n'
  printf '  <meta name="theme-color" content="#f5f5f7" />\n'
  printf '  <title>Totals</title>\n<style>\n'
  cat "$DIR/styles.css"
  printf '</style>\n</head>\n<body>\n'
  cat "$DIR/body.inc"
  printf '\n<script>\n'
  cat "$DIR"/js/*.js
  printf '</script>\n</body>\n</html>\n'
} > "$OUT"

echo "Built totals.html ($(wc -l < "$OUT") lines)"

# ── Generate totals.js (single-file, HTML embedded) ──
OUT_JS="$DIR/../totals.js"
HTML_ESCAPED=$(sed 's/\\/\\\\/g; s/`/\\`/g; s/\${/\\${/g' "$OUT")

# Build totals.js by writing parts sequentially (avoids bash & replacement bug)
{
  # Part 1: everything from totals.src.js before "var fm = FileManager.iCloud();"
  #   - skip the HTML_FILE variable line
  sed -n '1,/^var fm = FileManager.iCloud();$/{ /^var HTML_FILE = "totals.html";$/d; /^var fm = FileManager.iCloud();$/!p; }' "$DIR/totals.src.js"

  # Part 2: HTML_CONTENT template literal + var fm line
  printf 'var HTML_CONTENT = `'
  printf '%s' "$HTML_ESCAPED"
  printf '`;\n\nvar fm = FileManager.iCloud();\n'

  # Part 3: everything after "var fm = ..." with transforms applied
  sed -n '/^var fm = FileManager.iCloud();$/,${
    /^var fm = FileManager.iCloud();$/d
    /^  var htmlPath = fullPath(HTML_FILE);$/d
    /^    htmlPath,$/d
    /\/\/ Guard: HTML must exist/,/^$/d
    s/  var html = readSafe(htmlPath);/  var html = HTML_CONTENT;/
    p
  }' "$DIR/totals.src.js"
} > "$OUT_JS"

echo "Built totals.js ($(wc -l < "$OUT_JS") lines, single-file)"

# ── Copy outputs to data/ ──
DATA_DIR="$DIR/../data"
mkdir -p "$DATA_DIR"
cp "$OUT_JS" "$DATA_DIR/totals.js"
echo "Copied totals.js to data/"
