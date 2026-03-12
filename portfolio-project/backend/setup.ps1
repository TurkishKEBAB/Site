# Portfolio Backend - Quick Start Script
# Run this script to set up and start the backend development environment

Write-Host "🚀 Portfolio Backend Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($pythonVersion -match "Python 3\.(1[1-9]|[2-9]\d)") {
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python 3.11+ required. Current: $pythonVersion" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install --upgrade pip | Out-Null
pip install -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Check for .env file
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please edit it with your configuration!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Edit .env file before running the application!" -ForegroundColor Red
    Write-Host "  Required: DATABASE_URL, SECRET_KEY, SMTP credentials" -ForegroundColor Yellow
}

# Create logs directory
Write-Host ""
Write-Host "Creating logs directory..." -ForegroundColor Yellow
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}
Write-Host "✓ Logs directory ready" -ForegroundColor Green

# Check database connection
Write-Host ""
Write-Host "Checking database..." -ForegroundColor Yellow
Write-Host "  Make sure PostgreSQL is running and database is created" -ForegroundColor Cyan
Write-Host "  Run migrations from ../database folder if not done yet" -ForegroundColor Cyan

# Check Redis connection
Write-Host ""
Write-Host "Checking Redis..." -ForegroundColor Yellow
Write-Host "  Make sure Redis is running on localhost:6379" -ForegroundColor Cyan
Write-Host "  Or use Docker: docker run -d -p 6379:6379 redis:7-alpine" -ForegroundColor Cyan

# Setup complete
Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "  2. Run database migrations: cd ../database && python portfolio_migration.py" -ForegroundColor White
Write-Host "  3. Start Redis: docker run -d -p 6379:6379 redis:7-alpine" -ForegroundColor White
Write-Host "  4. Start the API: python -m app.main" -ForegroundColor White
Write-Host "  5. Or use uvicorn: uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor Green
Write-Host ""

# Ask if user wants to start the server
$response = Read-Host "Do you want to start the development server now? (y/N)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    Write-Host "  Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} else {
    Write-Host ""
    Write-Host "To start the server later, run:" -ForegroundColor Cyan
    Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
    Write-Host ""
}
