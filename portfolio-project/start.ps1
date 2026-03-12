param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$ResetData,
    [switch]$SkipSeed
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($BackendOnly -and $FrontendOnly) {
    throw "BackendOnly and FrontendOnly cannot be used together."
}

$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'
$composeFile = Join-Path $backendPath 'docker-compose.yml'
$backendHealthUrl = 'http://127.0.0.1:8000/health'
$projectsApiUrl = 'http://127.0.0.1:8000/api/v1/projects/?language=en&limit=1'
$frontendUrl = 'http://127.0.0.1:3000'

function Write-Section {
    param(
        [string]$Title,
        [ConsoleColor]$Color = [ConsoleColor]::Cyan
    )

    Write-Host ''
    Write-Host ('=' * 56) -ForegroundColor $Color
    Write-Host $Title -ForegroundColor $Color
    Write-Host ('=' * 56) -ForegroundColor $Color
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

function Invoke-Compose {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$ComposeArguments
    )

    if ($ComposeArguments.Count -eq 0) {
        throw 'Invoke-Compose received no compose subcommand arguments.'
    }

    & docker compose -f $composeFile @ComposeArguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose command failed: docker compose -f $composeFile $($ComposeArguments -join ' ')"
    }
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

function Wait-HttpOk {
    param(
        [string]$Url,
        [int]$TimeoutSec = 120,
        [int]$IntervalSec = 2
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.Elapsed.TotalSeconds -lt $TimeoutSec) {
        if (Test-HttpOk -Url $Url) {
            return $true
        }
        Start-Sleep -Seconds $IntervalSec
    }

    return $false
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

function Backup-LegacyPostgresData {
    param([string]$SourcePath)

    if ([string]::IsNullOrWhiteSpace($SourcePath) -or -not (Test-Path $SourcePath)) {
        return $null
    }

    $itemCount = (Get-ChildItem -Path $SourcePath -Force -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($itemCount -eq 0) {
        return $null
    }

    $backupRoot = Join-Path $projectRoot 'docker-data\postgres-backups'
    if (-not (Test-Path $backupRoot)) {
        New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    }

    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupPath = Join-Path $backupRoot "postgres-$timestamp"

    try {
        Move-Item -Path $SourcePath -Destination $backupPath -Force
    }
    catch {
        Copy-Item -Path $SourcePath -Destination $backupPath -Recurse -Force
        Remove-Item -Path $SourcePath -Recurse -Force
    }

    return $backupPath
}

function Migrate-LegacyPostgresContainer {
    $legacyBindSource = Get-LegacyPostgresBindSource
    if ([string]::IsNullOrWhiteSpace($legacyBindSource)) {
        return
    }

    Write-Host 'Legacy PostgreSQL bind mount detected. Migrating to named volume...' -ForegroundColor Yellow

    $backupPath = Backup-LegacyPostgresData -SourcePath $legacyBindSource
    if ($backupPath) {
        Write-Host "  -> Legacy data backup created: $backupPath" -ForegroundColor Yellow
    }

    docker rm -f portfolio_postgres 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'Failed to remove legacy portfolio_postgres container.'
    }

    Write-Host '  -> Legacy container removed. Compose will recreate PostgreSQL with named volume.' -ForegroundColor Green
}

function Remove-ConflictingContainer {
    param([string]$ContainerName)

    $containerId = docker ps -a --filter "name=^/$ContainerName$" -q 2>$null
    if (-not $containerId) {
        return
    }

    $labelsJson = docker inspect $ContainerName --format '{{json .Config.Labels}}' 2>$null
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($labelsJson)) {
        try {
            $labels = $labelsJson | ConvertFrom-Json
            if ($labels.'com.docker.compose.project' -eq 'backend') {
                return
            }
        }
        catch {
            # Continue and remove as conflicting if labels cannot be parsed.
        }
    }

    Write-Host "Removing legacy container that conflicts with compose: $ContainerName" -ForegroundColor Yellow
    docker rm -f $ContainerName 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to remove conflicting container: $ContainerName"
    }
}

function Ensure-BackendAndInfrastructure {
    if (-not (Test-DockerDaemon)) {
        throw 'Docker daemon is not reachable. Start Docker Desktop and retry.'
    }

    if ($ResetData) {
        Write-Host 'ResetData enabled. Removing compose services and volumes...' -ForegroundColor Yellow
        Invoke-Compose -ComposeArguments @('down', '-v', '--remove-orphans')
    }

    Migrate-LegacyPostgresContainer
    Remove-ConflictingContainer -ContainerName 'portfolio_postgres'
    Remove-ConflictingContainer -ContainerName 'portfolio_redis'
    Remove-ConflictingContainer -ContainerName 'portfolio_api'

    Write-Host 'Starting backend stack (postgres, redis, api) with docker compose...' -ForegroundColor Yellow
    Invoke-Compose -ComposeArguments @('up', '-d', '--build')

    Write-Host 'Waiting for backend health...' -ForegroundColor Yellow
    if (-not (Wait-HttpOk -Url $backendHealthUrl -TimeoutSec 180 -IntervalSec 3)) {
        Write-Host ''
        Write-Host 'docker compose ps output:' -ForegroundColor Red
        docker compose -f $composeFile ps
        Write-Host ''
        Write-Host 'Last API logs:' -ForegroundColor Red
        docker compose -f $composeFile logs --tail 120 api
        throw "Backend health check failed: $backendHealthUrl"
    }

    Write-Host 'Backend is healthy.' -ForegroundColor Green
}

function Ensure-ProjectSeed {
    if ($SkipSeed) {
        Write-Host 'Seed step skipped by -SkipSeed.' -ForegroundColor DarkYellow
        return
    }

    Write-Host 'Ensuring DB schema exists...' -ForegroundColor Yellow
    docker exec portfolio_api python /app/init_db.py | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'init_db.py failed inside portfolio_api container.'
    }

    $projectsResponse = $null
    try {
        $projectsResponse = Invoke-RestMethod -UseBasicParsing -Uri $projectsApiUrl -TimeoutSec 8
    }
    catch {
        throw "Projects API request failed after init_db: $projectsApiUrl"
    }

    $totalProjects = 0
    if ($null -ne $projectsResponse -and $null -ne $projectsResponse.total) {
        [void][int]::TryParse($projectsResponse.total.ToString(), [ref]$totalProjects)
    }

    if ($totalProjects -eq 0) {
        Write-Host 'Projects dataset is empty. Running auto-seed...' -ForegroundColor Yellow
        docker exec portfolio_api python /app/seed_data.py
        if ($LASTEXITCODE -ne 0) {
            throw 'seed_data.py failed inside portfolio_api container.'
        }

        Start-Sleep -Seconds 2
        $verifyResponse = Invoke-RestMethod -UseBasicParsing -Uri $projectsApiUrl -TimeoutSec 8
        $verifiedTotal = 0
        if ($null -ne $verifyResponse.total) {
            [void][int]::TryParse($verifyResponse.total.ToString(), [ref]$verifiedTotal)
        }
        Write-Host "Seed completed. Projects total: $verifiedTotal" -ForegroundColor Green
    }
    else {
        Write-Host "Projects already available. Total: $totalProjects" -ForegroundColor Green
    }
}

function Start-FrontendWindow {
    if (-not (Test-CommandAvailable -Command 'npm')) {
        throw 'npm was not found in PATH.'
    }

    if (Test-HttpOk -Url $frontendUrl) {
        Write-Host "Frontend is already reachable at $frontendUrl" -ForegroundColor Green
        return
    }

    $frontendScript = @"
Set-Location '$frontendPath'
`$host.UI.RawUI.WindowTitle = 'Portfolio Frontend - Vite'
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Portfolio Frontend Dev Server' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
if (-not (Test-Path node_modules)) {
    Write-Host 'Installing frontend dependencies (npm install)...' -ForegroundColor Yellow
    npm install
}
Write-Host 'Starting frontend: http://localhost:3000' -ForegroundColor Yellow
npm run dev
"@

    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($frontendScript))
    Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit', '-EncodedCommand', $encodedCommand | Out-Null

    Write-Host 'Frontend window opened.' -ForegroundColor Green
}

Write-Section -Title 'Portfolio Project Startup' -Color ([ConsoleColor]::Cyan)

if (-not (Test-Path $composeFile)) {
    throw "docker-compose.yml not found: $composeFile"
}

if (-not $FrontendOnly) {
    Write-Host '[1/3] Backend stack (Docker Compose)' -ForegroundColor Cyan
    Ensure-BackendAndInfrastructure

    Write-Host '[2/3] Schema + auto-seed check' -ForegroundColor Cyan
    Ensure-ProjectSeed
}
else {
    Write-Host '[Backend steps skipped: FrontendOnly mode]' -ForegroundColor DarkYellow
}

if (-not $BackendOnly) {
    Write-Host '[3/3] Frontend dev server' -ForegroundColor Cyan
    Start-FrontendWindow
}
else {
    Write-Host '[Frontend step skipped: BackendOnly mode]' -ForegroundColor DarkYellow
}

Write-Section -Title 'Startup Complete' -Color ([ConsoleColor]::Green)
Write-Host 'Frontend : http://localhost:3000' -ForegroundColor White
Write-Host 'Backend  : http://127.0.0.1:8000' -ForegroundColor White
Write-Host 'API Docs : http://127.0.0.1:8000/docs' -ForegroundColor White
Write-Host 'Projects : http://127.0.0.1:8000/api/v1/projects/?language=en' -ForegroundColor White
Write-Host ''
Write-Host 'Use .\status.ps1 to verify service health and .\stop.ps1 to stop services.' -ForegroundColor Yellow
