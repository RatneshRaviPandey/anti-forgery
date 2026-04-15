# Infometa — Production Startup Script
# Run this script to start the full production stack.
# Add to Windows Startup folder or Task Scheduler to auto-start on boot.

$env:PATH = "C:\Program Files (x86)\cloudflared;C:\pgsql\bin;C:\nodejs;C:\Program Files\Git\bin;" + $env:PATH

$projectDir = "C:\MyData\Business\NewProjects\anti-forgery"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Infometa Production Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Start PostgreSQL (if not already running)
$pgRunning = Get-Process postgres -ErrorAction SilentlyContinue
if (-not $pgRunning) {
    Write-Host "[1/3] Starting PostgreSQL..."
    $pgDataDir = "C:\pgsql\data"
    Start-Process -FilePath "C:\pgsql\bin\pg_ctl.exe" -ArgumentList "start -D `"$pgDataDir`" -l `"C:\pgsql\log\postgresql.log`"" -NoNewWindow -Wait
    Start-Sleep -Seconds 2
    
    $pgCheck = Get-Process postgres -ErrorAction SilentlyContinue
    if ($pgCheck) {
        Write-Host "  PostgreSQL started successfully" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: PostgreSQL failed to start!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/3] PostgreSQL already running" -ForegroundColor Green
}

# 2. Start Next.js via PM2
Write-Host "[2/3] Starting Infometa via PM2..."
Set-Location $projectDir

# Create logs directory
if (-not (Test-Path "$projectDir\logs")) { 
    New-Item -ItemType Directory -Path "$projectDir\logs" -Force | Out-Null 
}

pm2 start ecosystem.config.js --env production
Start-Sleep -Seconds 3

Write-Host "[3/4] Checking health..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  Site is live at http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "  WARNING: Site not responding yet. Check PM2 logs with: pm2 logs infometa" -ForegroundColor Yellow
}

# 4. Start Cloudflare Tunnel (background)
Write-Host "[4/4] Starting Cloudflare Tunnel..."
$tunnelRunning = Get-Process cloudflared -ErrorAction SilentlyContinue
if (-not $tunnelRunning) {
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel run infometa" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "  Tunnel started — site accessible at https://infometa.in" -ForegroundColor Green
} else {
    Write-Host "  Tunnel already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Infometa is running!" -ForegroundColor Green
Write-Host "  Public:  https://infometa.in" -ForegroundColor White
Write-Host "  Local:   http://localhost:3000" -ForegroundColor White
Write-Host "  Network: http://$(hostname):3000" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "  PM2 commands:" -ForegroundColor White
Write-Host "    pm2 status         — Check process status" -ForegroundColor Gray
Write-Host "    pm2 logs infometa  — View live logs" -ForegroundColor Gray
Write-Host "    pm2 restart infometa — Restart app" -ForegroundColor Gray
Write-Host "    pm2 stop infometa  — Stop app" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
