# FOCUS.bm — жергілікті орнату (npm + қалау бойынша git init)
# PowerShell: scripts\setup-local.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "== FOCUS.bm: backend npm install ==" -ForegroundColor Green
Set-Location "$Root\backend"
npm install
npx prisma generate

Write-Host "== FOCUS.bm: frontend npm install ==" -ForegroundColor Green
Set-Location "$Root\frontend"
npm install

Set-Location $Root

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git PATH-та жоқ — Git for Windows орнатыңыз, содан кейін:" -ForegroundColor Yellow
  Write-Host "  git init" -ForegroundColor Gray
  Write-Host "  git add -A" -ForegroundColor Gray
  Write-Host "  git commit -m `"Initial commit`"" -ForegroundColor Gray
  exit 0
}

if (-not (Test-Path "$Root\.git")) {
  Write-Host "== git init ==" -ForegroundColor Green
  git init
  git branch -M main
}

Write-Host "Дайын. Келесі қадам (қалау бойынша):" -ForegroundColor Green
Write-Host "  git add -A" -ForegroundColor Gray
Write-Host "  git commit -m `"FOCUS.bm: жасыл дизайн`"" -ForegroundColor Gray
Write-Host "  git remote add origin https://github.com/ЛОГИН/FOCUS.bm.git" -ForegroundColor Gray
Write-Host "  git push -u origin main" -ForegroundColor Gray
