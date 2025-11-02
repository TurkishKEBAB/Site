# Yigit Okur Portfolio Project Durdurma Scripti
# Bu script tum servisleri durdurur:
# - Frontend ve Backend process'leri
# - Docker containers (PostgreSQL + Redis)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Portfolio Project Durduruluyor..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend ve Frontend process'lerini durdur
Write-Host "[1/2] Backend ve Frontend process'leri durduruluyor..." -ForegroundColor Yellow

# Uvicorn (Backend) process'lerini bul ve durdur
$uvicornProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*uvicorn*"
}
if ($uvicornProcesses) {
    Write-Host "  -> Backend (Uvicorn) durduruluyor..." -ForegroundColor Green
    $uvicornProcesses | Stop-Process -Force
} else {
    Write-Host "  -> Backend process bulunamadi" -ForegroundColor Gray
}

# Node (Frontend) process'lerini bul ve durdur
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*vite*"
}
if ($nodeProcesses) {
    Write-Host "  -> Frontend (Vite) durduruluyor..." -ForegroundColor Green
    $nodeProcesses | Stop-Process -Force
} else {
    Write-Host "  -> Frontend process bulunamadi" -ForegroundColor Gray
}

Write-Host ""

# 2. Docker container'lari durdur (opsiyonel)
Write-Host "[2/2] Docker container'lar kontrol ediliyor..." -ForegroundColor Yellow
$stopContainers = Read-Host "Docker container'lari da durdurmak ister misiniz? (E/H)"
if ($stopContainers -eq "E" -or $stopContainers -eq "e") {
    Write-Host ""
    
    # PostgreSQL durdur
    $postgresRunning = docker ps --filter "name=portfolio_postgres" --filter "status=running" -q
    if ($postgresRunning) {
        Write-Host "  -> PostgreSQL durduruluyor..." -ForegroundColor Green
        docker stop portfolio_postgres
    } else {
        Write-Host "  -> PostgreSQL zaten durmus" -ForegroundColor Gray
    }
    
    # Redis durdur
    $redisRunning = docker ps --filter "name=portfolio_redis" --filter "status=running" -q
    if ($redisRunning) {
        Write-Host "  -> Redis durduruluyor..." -ForegroundColor Green
        docker stop portfolio_redis
    } else {
        Write-Host "  -> Redis zaten durmus" -ForegroundColor Gray
    }
} else {
    Write-Host "  -> Docker container'lar calismaya devam ediyor" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Islem tamamlandi!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ipucu: Projeyi yeniden baslatmak icin start.ps1" -ForegroundColor Yellow
Write-Host "        scriptini calistirin" -ForegroundColor Yellow
Write-Host ""
