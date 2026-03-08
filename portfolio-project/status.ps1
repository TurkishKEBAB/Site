Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section {
    param(
        [string]$Title,
        [ConsoleColor]$Color = [ConsoleColor]::Cyan
    )
    Write-Host ''
    Write-Host ('=' * 46) -ForegroundColor $Color
    Write-Host $Title -ForegroundColor $Color
    Write-Host ('=' * 46) -ForegroundColor $Color
}

function Write-Check {
    param(
        [string]$Label,
        [bool]$Ok,
        [string]$SuccessText,
        [string]$FailText
    )

    if ($Ok) {
        Write-Host "[OK]  $Label - $SuccessText" -ForegroundColor Green
    }
    else {
        Write-Host "[ERR] $Label - $FailText" -ForegroundColor Red
    }
}

function Test-CommandAvailable {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

function Test-DockerDaemon {
    if (-not (Test-CommandAvailable -Command 'docker')) {
        return $false
    }

    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    docker info --format '{{json .ServerVersion}}' 2>$null | Out-Null
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorAction

    return ($exitCode -eq 0)
}

function Test-HttpOk {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 4
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    }
    catch {
        return $false
    }
}

function Get-EnvRawValues {
    param(
        [string]$FilePath,
        [string]$Key
    )

    if (-not (Test-Path $FilePath)) {
        return @()
    }

    $values = @()
    $pattern = '^\s*' + [regex]::Escape($Key) + '\s*=\s*(.*)$'
    foreach ($line in Get-Content -Path $FilePath) {
        if ($line -match '^\s*#') {
            continue
        }
        if ($line -match $pattern) {
            $values += $matches[1].Trim()
        }
    }

    return $values
}

$repoRoot = $PSScriptRoot
$backendEnvPath = Join-Path $repoRoot 'backend\.env'

Write-Section -Title 'Portfolio Project Status' -Color ([ConsoleColor]::Cyan)

$dockerDaemonOk = Test-DockerDaemon
Write-Check -Label 'Docker daemon' -Ok $dockerDaemonOk -SuccessText 'running' -FailText 'not reachable'

$postgresRunning = $false
$redisRunning = $false

if ($dockerDaemonOk) {
    $postgresRunning = [bool](docker ps --filter 'name=portfolio_postgres' --filter 'status=running' -q)
    $redisRunning = [bool](docker ps --filter 'name=portfolio_redis' --filter 'status=running' -q)
}

Write-Check -Label 'PostgreSQL container' -Ok $postgresRunning -SuccessText 'portfolio_postgres is up' -FailText 'portfolio_postgres is not running'
Write-Check -Label 'Redis container' -Ok $redisRunning -SuccessText 'portfolio_redis is up' -FailText 'portfolio_redis is not running'

$backendOk = Test-HttpOk -Url 'http://127.0.0.1:8000/health'
$frontendOk = Test-HttpOk -Url 'http://127.0.0.1:3000'
$projectsApiOk = Test-HttpOk -Url 'http://127.0.0.1:8000/api/v1/projects/?language=en'

Write-Check -Label 'Backend health' -Ok $backendOk -SuccessText 'http://127.0.0.1:8000/health reachable' -FailText 'backend endpoint is not reachable'
Write-Check -Label 'Frontend health' -Ok $frontendOk -SuccessText 'http://127.0.0.1:3000 reachable' -FailText 'frontend endpoint is not reachable'
Write-Check -Label 'Projects API' -Ok $projectsApiOk -SuccessText 'projects endpoint returns success' -FailText 'projects endpoint failed'

$adminValues = @(Get-EnvRawValues -FilePath $backendEnvPath -Key 'ADMIN_EMAILS')
$adminConfigured = $adminValues.Count -gt 0 -and -not [string]::IsNullOrWhiteSpace($adminValues[0])
$adminDuplicate = $adminValues.Count -gt 1

$adminValueText = if ($adminConfigured) { $adminValues[0] } else { 'missing' }
Write-Check -Label 'ADMIN_EMAILS in backend/.env' -Ok $adminConfigured -SuccessText $adminValueText -FailText 'missing'
if ($adminDuplicate) {
    Write-Host "[WARN] backend/.env icinde ADMIN_EMAILS birden fazla kez tanimli. Tek satira dusurulmesi onerilir." -ForegroundColor Yellow
}

Write-Section -Title 'Quick Actions' -Color ([ConsoleColor]::Yellow)
Write-Host 'Start all services:   .\start.ps1' -ForegroundColor White
Write-Host 'Start without Docker: .\start.ps1 -SkipDocker' -ForegroundColor White
Write-Host 'Stop services:        .\stop.ps1' -ForegroundColor White
Write-Host 'Backend logs:         C:\Develop\Projects\Site\portfolio-project\logs' -ForegroundColor White
