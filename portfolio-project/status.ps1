Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$composeFile = Join-Path $backendPath 'docker-compose.yml'
$backendHealthUrl = 'http://127.0.0.1:8000/health'
$frontendUrl = 'http://127.0.0.1:3000'
$projectsApiUrl = 'http://127.0.0.1:8000/api/v1/projects/?language=en&limit=1'

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
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    }
    catch {
        return $false
    }
}

function Get-RunningComposeServices {
    if (-not (Test-Path $composeFile)) {
        return @()
    }

    $services = docker compose -f $composeFile ps --status running --services 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $services) {
        return @()
    }

    return @($services)
}

function Get-LegacyPostgresBindSource {
    $containerId = docker ps -a --filter "name=^/portfolio_postgres$" -q 2>$null
    if (-not $containerId) {
        return $null
    }

    $mountJson = docker inspect portfolio_postgres --format '{{json .Mounts}}' 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($mountJson)) {
        return $null
    }

    $mounts = $mountJson | ConvertFrom-Json
    $bindMount = @($mounts) | Where-Object {
        $_.Destination -eq '/var/lib/postgresql/data' -and $_.Type -eq 'bind'
    } | Select-Object -First 1

    if ($bindMount) {
        return $bindMount.Source
    }

    return $null
}

Write-Section -Title 'Portfolio Project Status' -Color ([ConsoleColor]::Cyan)

$dockerDaemonOk = Test-DockerDaemon
Write-Check -Label 'Docker daemon' -Ok $dockerDaemonOk -SuccessText 'running' -FailText 'not reachable'

$postgresOk = $false
$redisOk = $false
$apiContainerOk = $false

if ($dockerDaemonOk) {
    $runningServices = Get-RunningComposeServices
    $postgresOk = $runningServices -contains 'postgres'
    $redisOk = $runningServices -contains 'redis'
    $apiContainerOk = $runningServices -contains 'api'
}

Write-Check -Label 'PostgreSQL service' -Ok $postgresOk -SuccessText 'compose service is running' -FailText 'compose service is not running'
Write-Check -Label 'Redis service' -Ok $redisOk -SuccessText 'compose service is running' -FailText 'compose service is not running'
Write-Check -Label 'API container' -Ok $apiContainerOk -SuccessText 'compose service is running' -FailText 'compose service is not running'

$backendOk = Test-HttpOk -Url $backendHealthUrl
$frontendOk = Test-HttpOk -Url $frontendUrl
$projectsApiOk = Test-HttpOk -Url $projectsApiUrl

Write-Check -Label 'Backend health' -Ok $backendOk -SuccessText $backendHealthUrl -FailText 'backend endpoint is not reachable'
Write-Check -Label 'Frontend health' -Ok $frontendOk -SuccessText $frontendUrl -FailText 'frontend endpoint is not reachable'
Write-Check -Label 'Projects API' -Ok $projectsApiOk -SuccessText 'projects endpoint returns success' -FailText 'projects endpoint failed'

if ($projectsApiOk) {
    try {
        $projectsResponse = Invoke-RestMethod -UseBasicParsing -Uri $projectsApiUrl -TimeoutSec 8
        $projectTotal = if ($null -ne $projectsResponse.total) { $projectsResponse.total } else { 'unknown' }
        Write-Host "[INFO] Projects total: $projectTotal" -ForegroundColor Cyan
    }
    catch {
        Write-Host '[WARN] Projects endpoint is reachable but total count could not be parsed.' -ForegroundColor Yellow
    }
}

if ($dockerDaemonOk) {
    $legacyBindSource = Get-LegacyPostgresBindSource
    if ($legacyBindSource) {
        Write-Host "[WARN] Legacy PostgreSQL bind mount still detected: $legacyBindSource" -ForegroundColor Yellow
        Write-Host '       Run .\start.ps1 once to migrate it to compose named volume automatically.' -ForegroundColor Yellow
    }
}

Write-Section -Title 'Quick Actions' -Color ([ConsoleColor]::Yellow)
Write-Host 'Start all services:      .\start.ps1' -ForegroundColor White
Write-Host 'Start backend only:      .\start.ps1 -BackendOnly' -ForegroundColor White
Write-Host 'Start frontend only:     .\start.ps1 -FrontendOnly' -ForegroundColor White
Write-Host 'Stop services:           .\stop.ps1' -ForegroundColor White
Write-Host 'Stop and reset DB data:  .\stop.ps1 -ResetData' -ForegroundColor White
