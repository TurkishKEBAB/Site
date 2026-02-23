param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section {
    param([string]$Title)
    Write-Host ''
    Write-Host ('=' * 54) -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host ('=' * 54) -ForegroundColor Cyan
}

$repoRoot = $PSScriptRoot

Write-Section -Title 'Sprint 1 Quality Gate'

if (-not $SkipBackend) {
    Write-Host '[1/2] Backend tests + coverage' -ForegroundColor Yellow
    Set-Location $repoRoot
    python -m pytest -q
}
else {
    Write-Host '[1/2] Backend step skipped' -ForegroundColor DarkYellow
}

if (-not $SkipFrontend) {
    Write-Host '[2/2] Frontend lint/test/build + coverage' -ForegroundColor Yellow
    Set-Location (Join-Path $repoRoot 'frontend')
    npm run lint
    npm run test
    npm run test:coverage
    npm run build
}
else {
    Write-Host '[2/2] Frontend step skipped' -ForegroundColor DarkYellow
}

Set-Location $repoRoot
Write-Host ''
Write-Host 'Quality checks completed.' -ForegroundColor Green
Write-Host 'Backend coverage report: backend/coverage.xml' -ForegroundColor White
Write-Host 'Frontend coverage report: frontend/coverage/lcov.info' -ForegroundColor White
