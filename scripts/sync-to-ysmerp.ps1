# Bu repodaki dist/ -> YSMERP vendor (tek yon: ks-toast kaynak, ysmerp kopya).
# Calisma: ks-toast kokunde:  .\scripts\sync-to-ysmerp.ps1

$ErrorActionPreference = "Stop"
$here = Split-Path $PSScriptRoot -Parent
$src = Join-Path $here "dist"
$root = Split-Path $here -Parent
$dst = Join-Path $root "ysmerp\assets\vendor\ks-toast"

if (-not (Test-Path (Join-Path $src "ks-toast.js"))) {
    Write-Error "dist bulunamadi: $src (once dist'te duzenle)"
}

New-Item -ItemType Directory -Path $dst -Force | Out-Null
Copy-Item (Join-Path $src "ks-toast.js") (Join-Path $dst "ks-toast.js") -Force
Copy-Item (Join-Path $src "ks-toast.css") (Join-Path $dst "ks-toast.css") -Force
Write-Host "OK: $src -> $dst"
Write-Host ''
