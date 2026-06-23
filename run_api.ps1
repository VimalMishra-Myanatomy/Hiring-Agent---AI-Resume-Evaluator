# Run FastAPI backend (from project root)
# Usage: .\run_api.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "Virtual env not found. Run: python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt"
    exit 1
}

if (-not (Test-Path ".env")) {
    Write-Host "Missing .env — copy .env.example and set GEMINI_API_KEY"
    exit 1
}

Write-Host "Starting API on http://localhost:8000"
.\.venv\Scripts\python.exe -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
