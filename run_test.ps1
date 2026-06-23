# End-to-end test: score a resume PDF with Gemini
# Usage: .\run_test.ps1 [path\to\resume.pdf]

param(
    [string]$ResumePath = "samples\Vimal_Mishra_SSE_2025.pdf"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "Virtual env not found. Run: python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt"
    exit 1
}

if (-not (Test-Path ".env")) {
    Write-Host "Missing .env file. Copy .env.example to .env and set GEMINI_API_KEY."
    exit 1
}

$envContent = Get-Content ".env" -Raw
if ($envContent -match "GEMINI_API_KEY=your_gemini_api_key_here" -or $envContent -notmatch "GEMINI_API_KEY=\S+") {
    Write-Host ""
    Write-Host "Set your Gemini API key in .env:"
    Write-Host "  GEMINI_API_KEY=<your-key-from-https://aistudio.google.com/api-keys>"
    Write-Host ""
    exit 1
}

if (-not (Test-Path $ResumePath)) {
    Write-Host "Resume not found: $ResumePath"
    Write-Host "Creating sample resume..."
    .\.venv\Scripts\python.exe samples\create_sample_resume.py
}

Write-Host "Scoring resume: $ResumePath"
Write-Host "Provider: gemini (from .env)"
Write-Host ""

.\.venv\Scripts\python.exe score.py $ResumePath
