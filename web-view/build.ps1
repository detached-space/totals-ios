$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$out = Join-Path $dir "..\totals.html"
$utf8 = New-Object System.Text.UTF8Encoding $false

# Read source files (raw bytes, matching cat behavior)
$css = [System.IO.File]::ReadAllText("$dir\styles.css", $utf8)
$body = [System.IO.File]::ReadAllText("$dir\body.inc", $utf8)
$js = (Get-ChildItem "$dir\js\*.js" | Sort-Object Name | ForEach-Object {
  [System.IO.File]::ReadAllText($_.FullName, $utf8)
}) -join ""

# Assemble (mirrors build.sh: printf preamble, cat file, printf glue, ...)
$result = "<!doctype html>`n<html lang=`"en`">`n<head>`n" +
  "  <meta charset=`"UTF-8`" />`n" +
  "  <meta name=`"viewport`" content=`"width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no`" />`n" +
  "  <meta name=`"apple-mobile-web-app-capable`" content=`"yes`" />`n" +
  "  <meta name=`"apple-mobile-web-app-status-bar-style`" content=`"black-translucent`" />`n" +
  "  <meta name=`"theme-color`" content=`"#f5f5f7`" />`n" +
  "  <title>Totals</title>`n<style>`n" +
  $css +
  "</style>`n</head>`n<body>`n" +
  $body +
  "`n<script>`n" +
  $js +
  "</script>`n</body>`n</html>`n"

[System.IO.File]::WriteAllText($out, $result, $utf8)

$lines = [System.IO.File]::ReadAllLines($out, $utf8).Count
Write-Host "Built totals.html ($lines lines)"

# ── Generate totals.js (single-file, HTML embedded) ──
$outJs = Join-Path $dir "..\totals.js"
$srcJs = [System.IO.File]::ReadAllText("$dir\totals.src.js", $utf8)

# Escape HTML for a JS template literal: \ → \\, ` → \`, ${ → \${
$escaped = $result.Replace('\', '\\').Replace('`', '\`').Replace('${', '\${')

# Insert HTML_CONTENT variable right before "var fm = ..."
$srcJs = $srcJs.Replace(
  "var fm = FileManager.iCloud();",
  "var HTML_CONTENT = ``$escaped``;" + "`n`nvar fm = FileManager.iCloud();"
)

# Remove HTML_FILE variable
$srcJs = $srcJs.Replace("var HTML_FILE = `"totals.html`";`n", "")

# Remove htmlPath from vars and paths array
$srcJs = $srcJs.Replace("  var htmlPath = fullPath(HTML_FILE);`n", "")
$srcJs = $srcJs.Replace("    htmlPath,`n", "")

# Remove the "Guard: HTML must exist" block
$guardStart = $srcJs.IndexOf("  // Guard: HTML must exist")
$guardEnd = $srcJs.IndexOf("  var html = readSafe(htmlPath);")
if ($guardStart -ge 0 -and $guardEnd -ge 0) {
  $srcJs = $srcJs.Remove($guardStart, $guardEnd - $guardStart)
}

# Replace the html reading line with the embedded content
$srcJs = $srcJs.Replace(
  "  var html = readSafe(htmlPath);",
  "  var html = HTML_CONTENT;"
)

[System.IO.File]::WriteAllText($outJs, $srcJs, $utf8)

$jsLines = [System.IO.File]::ReadAllLines($outJs, $utf8).Count
Write-Host "Built totals.js ($jsLines lines, single-file)"
