<#
start.ps1
Simple starter script to open two PowerShell windows: one for the backend (FastAPI)
and one for the frontend (Vite). It will create virtualenv / install deps if missing
and copy `.env.example` to `.env` when appropriate.

Usage: From repository root run `./start.ps1` in PowerShell (may require ExecutionPolicy
override: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`).
#>

$ErrorActionPreference = 'Stop'

# repo root (script directory)
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

# Prefer pwsh if available, fall back to powershell.exe
$pwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
if ($pwshCmd) { $shell = $pwshCmd.Path } else { $shell = (Get-Command powershell).Path }

# Backend starter
$backendDir = Join-Path $root 'portfolio-project\backend'
$backendCmd = @"
cd "$backendDir"
Write-Host 'Backend: preparing virtual environment and dependencies...'
if (-not (Test-Path venv)) {
    python -m venv venv
}
if (Test-Path venv) {
    .\venv\Scripts\Activate.ps1
}
if (Test-Path requirements.txt) {
    pip install -r requirements.txt
}
if (-not (Test-Path .env) -and (Test-Path .env.example)) {
    Copy-Item .env.example .env -Force
    Write-Host '.env created from .env.example (please review values)'
}
Write-Host 'Starting backend (uvicorn) at http://127.0.0.1:8000'
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
"@

Start-Process -FilePath $shell -ArgumentList '-NoExit','-Command',$backendCmd

# Frontend starter
$frontendDir = Join-Path $root 'portfolio-project\frontend'
$frontendCmd = @"
cd "$frontendDir"
Write-Host 'Frontend: installing node modules if needed...'
if (-not (Test-Path node_modules)) {
    npm install
}
Write-Host 'Starting frontend (Vite) at http://localhost:5173'
npm run dev -- --host
"@

Start-Process -FilePath $shell -ArgumentList '-NoExit','-Command',$frontendCmd

Pop-Location
