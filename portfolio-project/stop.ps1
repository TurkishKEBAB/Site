param(
    [switch]$ResetData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$composeFile = Join-Path $backendPath 'docker-compose.yml'
$frontendPort = 3000

function Write-Section {
    param(
        [string]$Title,
        [ConsoleColor]$Color = [ConsoleColor]::Cyan
    )

    Write-Host ''
    Write-Host ('=' * 52) -ForegroundColor $Color
    Write-Host $Title -ForegroundColor $Color
    Write-Host ('=' * 52) -ForegroundColor $Color
}

function Test-CommandAvailable {
    param([string]$Command)

    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

function Stop-FrontendProcess {
    Write-Host 'Stopping local frontend process on port 3000 (if any)...' -ForegroundColor Yellow

    $frontendPids = @()
    try {
        $frontendPids = @(
            Get-NetTCPConnection -LocalPort $frontendPort -State Listen -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty OwningProcess -Unique
        )
    }
    catch {
        $frontendPids = @()
    }

    if ($frontendPids.Count -eq 0) {
        Write-Host '  -> No frontend process detected on port 3000.' -ForegroundColor Gray
        return
    }

    foreach ($pidValue in $frontendPids) {
        if ($pidValue -eq $PID) {
            continue
        }

        try {
            Stop-Process -Id $pidValue -Force -ErrorAction Stop
            Write-Host "  -> Stopped PID $pidValue" -ForegroundColor Green
        }
        catch {
            Write-Host "  -> Could not stop PID ${pidValue}: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

function Stop-ComposeStack {
    if (-not (Test-Path $composeFile)) {
        Write-Host "Compose file not found: $composeFile" -ForegroundColor Yellow
        return
    }

    if (-not (Test-CommandAvailable -Command 'docker')) {
        Write-Host 'Docker command not found. Skipping compose shutdown.' -ForegroundColor Yellow
        return
    }

    Write-Host 'Stopping docker compose stack...' -ForegroundColor Yellow

    if ($ResetData) {
        Write-Host '  -> ResetData enabled: containers, networks and volumes will be removed.' -ForegroundColor Yellow
        docker compose -f $composeFile down -v --remove-orphans
    }
    else {
        docker compose -f $composeFile down --remove-orphans
    }

    if ($LASTEXITCODE -ne 0) {
        throw 'docker compose down failed.'
    }

    Write-Host '  -> Compose stack stopped.' -ForegroundColor Green
}

Write-Section -Title 'Portfolio Project Shutdown' -Color ([ConsoleColor]::Cyan)

Stop-FrontendProcess
Stop-ComposeStack

Write-Section -Title 'Shutdown Complete' -Color ([ConsoleColor]::Green)
Write-Host 'Start again: .\start.ps1' -ForegroundColor White
if ($ResetData) {
    Write-Host 'Data was reset. Next start will initialize a fresh database.' -ForegroundColor Yellow
}
