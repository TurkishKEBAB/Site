# Portfolio Project Launcher
# Starts Docker dependencies (PostgreSQL + Redis), backend (FastAPI) and frontend (Vite)

param(
    [switch]$SkipDocker,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 3000,
    [int]$PostgresPort = 5432,
    [int]$RedisPort = 6379
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section {
    param(
        [string]$Title,
        [ConsoleColor]$Color = [ConsoleColor]::Cyan
    )
    Write-Host "" -ForegroundColor $Color
    Write-Host ('=' * 46) -ForegroundColor $Color
    Write-Host $Title -ForegroundColor $Color
    Write-Host ('=' * 46) -ForegroundColor $Color
    Write-Host ""
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

function Get-AvailablePort {
    param(
        [int]$Preferred,
        [int]$Attempts = 20
    )
    for ($offset = 0; $offset -lt $Attempts; $offset++) {
        $candidate = $Preferred + $offset
        
        # Check if port is in use by trying to bind
        $listener = $null
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $candidate)
            $listener.Start()
            $listener.Stop()
            
            # Double-check: ensure no process is using this port
            $netstatCheck = netstat -ano | Select-String ":$candidate " | Select-String "LISTENING"
            if (-not $netstatCheck) {
                return $candidate
            }
        } catch {
            continue
        } finally {
            if ($listener) {
                try { $listener.Stop() } catch { }
            }
        }
    }

    throw "Uygun port bulunamadi (baslangic: $Preferred)."
}

function Get-DockerHostPort {
    param(
        [string]$ContainerName,
        [int]$ContainerPort
    )

    $format = ('{{range $key, $value := .NetworkSettings.Ports}}{{if eq $key "{0}/tcp"}}{{(index (index $value 0) "HostPort")}}{{end}}{{end}}' -f $ContainerPort)
        $result = docker inspect -f $format $ContainerName 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }
    $trimmed = $result.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) {
        return $null
    }
    $parsed = 0
    if ([int]::TryParse($trimmed, [ref]$parsed)) {
        return $parsed
    }
    return $null
}

function Ensure-DockerContainer {
    param(
        [string]$Name,
        [string]$Image,
        [int]$PreferredHostPort,
        [int]$ContainerPort,
        [string[]]$ExtraArgs,
        [ref]$ResolvedHostPort
    )

    if (-not (Test-CommandAvailable -Command 'docker')) {
        throw "Docker bulunamadi. Lutfen Docker Desktop'in calistigindan emin olun."
    }

    $running = docker ps --filter "name=$Name" --filter "status=running" -q
    if ($running) {
        $currentHostPort = Get-DockerHostPort -ContainerName $Name -ContainerPort $ContainerPort
        if ($currentHostPort) {
            $ResolvedHostPort.Value = $currentHostPort
            Write-Host "  -> $Name zaten calisiyor (port $currentHostPort)" -ForegroundColor Green
        } else {
            $ResolvedHostPort.Value = $PreferredHostPort
            Write-Host "  -> $Name zaten calisiyor" -ForegroundColor Green
        }
        return
    }

    $hostPort = $PreferredHostPort
    $existing = docker ps -a --filter "name=$Name" -q

    if ($existing) {
        $existingHostPort = Get-DockerHostPort -ContainerName $Name -ContainerPort $ContainerPort
        if ($existingHostPort) {
            $hostPort = $existingHostPort
        }

        Write-Host "  -> $Name baslatiliyor..." -ForegroundColor Green
        
        # Temporarily allow errors to capture output
        $previousErrorAction = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        $startOutput = docker start $Name 2>&1
        $startExitCode = $LASTEXITCODE
        $ErrorActionPreference = $previousErrorAction

        if ($startExitCode -eq 0) {
            $ResolvedHostPort.Value = $hostPort
            Write-Host "     (Port $hostPort kullaniliyor)" -ForegroundColor Green
            return
        }

        $startOutputText = ($startOutput | Out-String).Trim()
        if ($startOutputText -match 'port is already allocated') {
            Write-Host "     Port $hostPort kullanimda, yeni port araniyor..." -ForegroundColor Yellow
            docker rm -f $Name 2>&1 | Out-Null
            
            # Find first available port starting from preferred + 1
            $hostPort = Get-AvailablePort -Preferred ($PreferredHostPort + 1)
            Write-Host "     Yeniden olusturulacak: $hostPort -> $ContainerPort" -ForegroundColor Yellow
        } else {
            throw "Docker container '$Name' baslatilamadi. Ayrinti: $startOutputText"
        }
    } else {
        # No existing container, find available port
        $hostPort = Get-AvailablePort -Preferred $PreferredHostPort
    }

    $ResolvedHostPort.Value = $hostPort
    Write-Host "  -> $Name olusturuluyor..." -ForegroundColor Green
    $arguments = @('-p', "${hostPort}:$ContainerPort") + $ExtraArgs
    
    # Try to create container with retry logic for port conflicts
    $maxRetries = 5
    $retryCount = 0
    $created = $false
    
    while (-not $created -and $retryCount -lt $maxRetries) {
        # Temporarily allow errors to capture output
        $previousErrorAction = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        $runOutput = docker run -d --name $Name @arguments $Image 2>&1
        $runExitCode = $LASTEXITCODE
        $ErrorActionPreference = $previousErrorAction

        if ($runExitCode -eq 0) {
            $created = $true
            Write-Host "     (Port $hostPort -> $ContainerPort)" -ForegroundColor Green
        } else {
            $runOutputText = ($runOutput | Out-String).Trim()
            if ($runOutputText -match 'port is already allocated') {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Host "     Port $hostPort kullanimda, alternatif port deneniyor... ($retryCount/$maxRetries)" -ForegroundColor Yellow
                    
                    # Remove failed container if exists
                    docker rm -f $Name 2>&1 | Out-Null
                    
                    # Find next available port
                    $hostPort = Get-AvailablePort -Preferred ($hostPort + 1)
                    $ResolvedHostPort.Value = $hostPort
                    $arguments = @('-p', "${hostPort}:$ContainerPort") + $ExtraArgs
                } else {
                    throw "Docker container '$Name' olusturulurken hata olustu. $maxRetries deneme sonrasi basarisiz. Son port: $hostPort. Ayrinti: $runOutputText"
                }
            } else {
                throw "Docker container '$Name' olusturulurken hata olustu. Ayrinti: $runOutputText"
            }
        }
    }
}

if ($BackendOnly -and $FrontendOnly) {
    throw "BackendOnly ve FrontendOnly ayni anda kullanilamaz."
}

$backendPath = Join-Path $PSScriptRoot 'backend'
$frontendPath = Join-Path $PSScriptRoot 'frontend'

Write-Section -Title 'Portfolio Project Baslatiliyor' -Color ([ConsoleColor]::Cyan)

if (-not (Test-Path $backendPath)) {
    throw "Backend klasoru bulunamadi: $backendPath"
}

if (-not (Test-Path $frontendPath)) {
    throw "Frontend klasoru bulunamadi: $frontendPath"
}

if (-not $SkipDocker) {
    if (-not (Test-DockerDaemon)) {
        throw "Docker daemon erisilebilir degil. Docker Desktop'i baslatin veya scripti -SkipDocker ile calistirin."
    }

    Write-Host '[1/3] Docker servisleri hazirlaniyor...' -ForegroundColor Yellow

    $postgresDataPath = Join-Path $PSScriptRoot 'docker-data\postgres'
    if (-not (Test-Path $postgresDataPath)) {
        New-Item -ItemType Directory -Path $postgresDataPath | Out-Null
    }
    $postgresDataResolved = (Resolve-Path $postgresDataPath).Path

    $resolvedPostgresPort = $PostgresPort
    Ensure-DockerContainer -Name 'portfolio_postgres' -Image 'postgres:15-alpine' -PreferredHostPort $PostgresPort -ContainerPort 5432 -ExtraArgs @(
        '-e', 'POSTGRES_USER=postgres',
        '-e', 'POSTGRES_PASSWORD=postgres',
        '-e', 'POSTGRES_DB=portfolio',
        '-v', "${postgresDataResolved}:/var/lib/postgresql/data"
    ) -ResolvedHostPort ([ref]$resolvedPostgresPort)

    $resolvedRedisPort = $RedisPort
    Ensure-DockerContainer -Name 'portfolio_redis' -Image 'redis:7-alpine' -PreferredHostPort $RedisPort -ContainerPort 6379 -ExtraArgs @() -ResolvedHostPort ([ref]$resolvedRedisPort)
} else {
    Write-Host '[Docker adimi atlandi]' -ForegroundColor DarkYellow
}

Write-Host ''
Write-Host '[2/3] Servisler baslatiliyor...' -ForegroundColor Yellow

# Log dizinini olustur
$logsPath = Join-Path $PSScriptRoot 'logs'
if (-not (Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath | Out-Null
}

function Start-Backend {
    $backendPython = Join-Path $backendPath 'venv\Scripts\python.exe'
    if (-not (Test-Path $backendPython)) {
        throw "Backend sanal ortami bulunamadi. Lutfen backend/setup.ps1 calistirin."
    }

    Write-Host '  * Backend baslatiliyor...' -ForegroundColor Cyan
    
    # Backend'i yeni bir PowerShell penceresinde baslat
    $backendScript = @"
Set-Location '$backendPath'
`$host.UI.RawUI.WindowTitle = 'Portfolio Backend - uvicorn'
Write-Host ''
Write-Host '================================' -ForegroundColor Cyan
Write-Host 'Portfolio Backend API' -ForegroundColor Cyan
Write-Host '================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Backend baslatiliyor...' -ForegroundColor Yellow
Write-Host 'Port: $BackendPort' -ForegroundColor White
Write-Host ''
`$env:PYTHONUTF8 = '1'
`$env:PYTHONIOENCODING = 'utf-8'
& '$backendPython' -m uvicorn app.main:app --reload --host 127.0.0.1 --port $BackendPort
"@
    
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($backendScript))
    Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit', '-EncodedCommand', $encodedCommand
    
    Write-Host '  * Backend penceresi acildi' -ForegroundColor Green
    Start-Sleep -Seconds 3
}

function Start-Frontend {
    $nodeModules = Join-Path $frontendPath 'node_modules'
    if (-not (Test-Path $nodeModules)) {
        throw "Frontend bagimliliklari eksik. Lutfen frontend dizininde npm install calistirin."
    }

    Write-Host '  * Frontend baslatiliyor...' -ForegroundColor Cyan
    
    # Frontend'i yeni bir PowerShell penceresinde baslat
    $frontendScript = @"
Set-Location '$frontendPath'
`$host.UI.RawUI.WindowTitle = 'Portfolio Frontend - Vite'
Write-Host ''
Write-Host '================================' -ForegroundColor Cyan
Write-Host 'Portfolio Frontend Dev Server' -ForegroundColor Cyan
Write-Host '================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Vite dev server baslatiliyor...' -ForegroundColor Yellow
Write-Host 'Port: $FrontendPort (vite.config.ts)' -ForegroundColor White
Write-Host ''
npm run dev
"@
    
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($frontendScript))
    Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit', '-EncodedCommand', $encodedCommand
    
    Write-Host '  * Frontend penceresi acildi' -ForegroundColor Green
    Start-Sleep -Seconds 2
}

try {
    if (-not $FrontendOnly) {
        Start-Backend
    } else {
        Write-Host '  * Backend adimi atlandi' -ForegroundColor DarkYellow
    }

    if (-not $BackendOnly) {
        Start-Frontend
    } else {
        Write-Host '  * Frontend adimi atlandi' -ForegroundColor DarkYellow
    }
}
catch {
    Write-Host ''
    Write-Host 'Baslatma sirasinda hata olustu:' -ForegroundColor Red
    $errorMessage = $_.Exception.Message
    Write-Host $errorMessage -ForegroundColor Red
    if ($errorMessage -match 'port is already allocated') {
        Write-Host ' -> Bir diger uygulama ayni portu kullaniyor olabilir. Servisi durdurun veya scripti farkli port ile tekrar calistirin (ornegin: -PostgresPort 5433 veya -RedisPort 6380).' -ForegroundColor Yellow
    }
    Write-Host ''
    Write-Host 'Ayrintilar icin yukaridaki cikisi inceleyin.' -ForegroundColor Red
    exit 1
}

Write-Section -Title 'Servisler basarili bir sekilde baslatildi' -Color ([ConsoleColor]::Green)
Write-Host "Frontend : http://localhost:$FrontendPort" -ForegroundColor White
Write-Host "Backend  : http://127.0.0.1:$BackendPort" -ForegroundColor White
Write-Host ("API Docs : http://127.0.0.1:{0}/docs" -f $BackendPort) -ForegroundColor White
Write-Host ("Admin    : http://localhost:{0}/admin" -f $FrontendPort) -ForegroundColor White

if (-not $SkipDocker) {
    Write-Host ''
    Write-Host "PostgreSQL host port : $resolvedPostgresPort -> container 5432" -ForegroundColor Gray
    Write-Host "Redis host port     : $resolvedRedisPort -> container 6379" -ForegroundColor Gray
}

Write-Host ''
Write-Host 'Servisleri durdurmak icin acilan terminallerde Ctrl+C kullanabilir veya stop.ps1 scriptini calistirabilirsiniz.' -ForegroundColor Yellow
