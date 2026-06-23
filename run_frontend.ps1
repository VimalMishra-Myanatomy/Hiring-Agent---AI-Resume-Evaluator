# Run frontend dev server (from project root)
# Usage: .\run_frontend.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$Root\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (requires Node 18+)..."
    npm install
}

Write-Host "Starting UI on http://localhost:5173 (proxies /api -> :8000)"
npm run dev
