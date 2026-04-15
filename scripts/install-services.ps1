# Infometa — Install Windows Services (Run as Administrator)
# This script registers PostgreSQL, Cloudflare Tunnel, and PM2 as Windows services
# so infometa.in runs 24/7 without requiring VS Code or any terminal open.

#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Infometa Service Installation" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Phase 1: System PATH ──────────────────────────────────────
Write-Host "[Phase 1/4] Updating system PATH..." -ForegroundColor Yellow

$currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'Machine')
$pathsToAdd = @('C:\nodejs', 'C:\pgsql\bin', 'C:\Program Files\Git\bin')
$added = @()

foreach ($p in $pathsToAdd) {
    if ($currentPath -notlike "*$p*") {
        $added += $p
    }
}

if ($added.Count -gt 0) {
    $newPath = ($added -join ';') + ';' + $currentPath
    [System.Environment]::SetEnvironmentVariable('PATH', $newPath, 'Machine')
    # Also update current session
    $env:PATH = ($added -join ';') + ';' + $env:PATH
    Write-Host "  Added to system PATH: $($added -join ', ')" -ForegroundColor Green
} else {
    Write-Host "  All paths already in system PATH" -ForegroundColor Green
}

# Ensure current session has all paths
$env:PATH = "C:\Program Files (x86)\cloudflared;C:\pgsql\bin;C:\nodejs;C:\Program Files\Git\bin;" + $env:PATH

# ── Phase 2: PostgreSQL Service ───────────────────────────────
Write-Host ""
Write-Host "[Phase 2/4] Registering PostgreSQL service..." -ForegroundColor Yellow

$pgService = Get-Service -Name "PostgreSQL" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "  PostgreSQL service already exists (Status: $($pgService.Status))" -ForegroundColor Green
} else {
    # Stop any manually-running postgres first
    $pgProc = Get-Process postgres -ErrorAction SilentlyContinue
    if ($pgProc) {
        Write-Host "  Stopping manual PostgreSQL process..."
        & pg_ctl stop -D "C:\pgsql\data" -m fast 2>&1 | Out-Null
        Start-Sleep -Seconds 2
    }

    # Register as Windows service
    & pg_ctl register -N "PostgreSQL" -D "C:\pgsql\data" -S auto 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  PostgreSQL registered as Windows service" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Failed to register PostgreSQL service" -ForegroundColor Red
        exit 1
    }
}

# Ensure service is running
$pgService = Get-Service -Name "PostgreSQL" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -ne 'Running') {
    Start-Service PostgreSQL
    Start-Sleep -Seconds 3
}

# Verify
$pgReady = & pg_isready -p 5433 2>&1
if ($pgReady -like "*accepting*") {
    Write-Host "  PostgreSQL verified: accepting connections on port 5433" -ForegroundColor Green
} else {
    Write-Host "  WARNING: PostgreSQL not accepting connections yet: $pgReady" -ForegroundColor Yellow
}

# ── Phase 3: Cloudflare Tunnel Service ────────────────────────
Write-Host ""
Write-Host "[Phase 3/4] Registering Cloudflare Tunnel service..." -ForegroundColor Yellow

$cfService = Get-Service -Name "Cloudflared" -ErrorAction SilentlyContinue
if ($cfService) {
    Write-Host "  Cloudflared service already exists (Status: $($cfService.Status))" -ForegroundColor Green
} else {
    # Kill any manually-running cloudflared
    $cfProc = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($cfProc) {
        Write-Host "  Stopping manual cloudflared process..."
        Stop-Process -Name cloudflared -Force 2>&1 | Out-Null
        Start-Sleep -Seconds 2
    }

    # Install as Windows service
    & cloudflared service install 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Cloudflared registered as Windows service" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: cloudflared service install returned code $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host "  (This is sometimes OK — checking if service exists...)" -ForegroundColor Yellow
    }
}

# Ensure service is running
$cfService = Get-Service -Name "Cloudflared" -ErrorAction SilentlyContinue
if ($cfService) {
    if ($cfService.Status -ne 'Running') {
        Start-Service Cloudflared
        Start-Sleep -Seconds 3
    }
    Write-Host "  Cloudflared service status: $((Get-Service Cloudflared).Status)" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Cloudflared service not found after installation" -ForegroundColor Red
}

# ── Phase 4: PM2 Service via NSSM ────────────────────────────
Write-Host ""
Write-Host "[Phase 4/4] Registering PM2 as Windows service..." -ForegroundColor Yellow

# Set PM2_HOME system-wide so the service and CLI share the same process list
$pm2Home = [System.Environment]::GetEnvironmentVariable('PM2_HOME', 'Machine')
$desiredPm2Home = "C:\Users\Admin\.pm2"
if ($pm2Home -ne $desiredPm2Home) {
    [System.Environment]::SetEnvironmentVariable('PM2_HOME', $desiredPm2Home, 'Machine')
    $env:PM2_HOME = $desiredPm2Home
    Write-Host "  Set PM2_HOME=$desiredPm2Home (system-wide)" -ForegroundColor Green
} else {
    Write-Host "  PM2_HOME already set to $desiredPm2Home" -ForegroundColor Green
}

# Save current PM2 process list
Write-Host "  Saving PM2 process list..."
$pm2SaveOutput = & pm2 save 2>&1
Write-Host "  $pm2SaveOutput"

# Check if NSSM is available, download if not
$nssmPath = "C:\tools\nssm\nssm.exe"
$pm2Service = Get-Service -Name "PM2" -ErrorAction SilentlyContinue

if ($pm2Service) {
    Write-Host "  PM2 service already exists (Status: $($pm2Service.Status))" -ForegroundColor Green
} else {
    # Download NSSM (lightweight, no installer needed)
    if (-not (Test-Path $nssmPath)) {
        Write-Host "  Downloading NSSM (service wrapper)..."
        New-Item -ItemType Directory -Path "C:\tools\nssm" -Force | Out-Null
        $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
        $nssmZip = "C:\tools\nssm\nssm.zip"
        
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip -UseBasicParsing
            Expand-Archive -Path $nssmZip -DestinationPath "C:\tools\nssm\temp" -Force
            Copy-Item "C:\tools\nssm\temp\nssm-2.24\win64\nssm.exe" $nssmPath -Force
            Remove-Item "C:\tools\nssm\temp" -Recurse -Force
            Remove-Item $nssmZip -Force
            Write-Host "  NSSM downloaded to $nssmPath" -ForegroundColor Green
        } catch {
            Write-Host "  ERROR: Failed to download NSSM: $_" -ForegroundColor Red
            Write-Host "  Please download manually from https://nssm.cc/release/nssm-2.24.zip" -ForegroundColor Yellow
            Write-Host "  Extract win64/nssm.exe to C:\tools\nssm\nssm.exe and re-run this script" -ForegroundColor Yellow
            exit 1
        }
    }

    # Create PM2 service using NSSM
    Write-Host "  Creating PM2 service with NSSM..."
    
    # The service will run: node C:\nodejs\node_modules\pm2\bin\pm2 resurrect
    # But simpler: create a startup script that pm2 resurrect calls
    $pm2BinPath = (Get-Command pm2 -ErrorAction SilentlyContinue).Source
    if (-not $pm2BinPath) {
        $pm2BinPath = "C:\nodejs\pm2.cmd"
    }
    
    # Create a wrapper script for the PM2 service
    $pm2ServiceScript = @"
@echo off
set PATH=C:\nodejs;C:\pgsql\bin;C:\Program Files (x86)\cloudflared;C:\Program Files\Git\bin;%PATH%
set PM2_HOME=$desiredPm2Home
set NODE_ENV=production
cd /d C:\MyData\Business\NewProjects\anti-forgery
C:\nodejs\node.exe C:\nodejs\node_modules\pm2\bin\pm2 resurrect --no-daemon
"@
    $pm2ServiceScriptPath = "C:\tools\nssm\pm2-service.cmd"
    Set-Content -Path $pm2ServiceScriptPath -Value $pm2ServiceScript -Encoding ASCII
    Write-Host "  Created PM2 service wrapper: $pm2ServiceScriptPath"

    # Install service via NSSM
    & $nssmPath install PM2 $pm2ServiceScriptPath 2>&1
    & $nssmPath set PM2 DisplayName "PM2 Process Manager" 2>&1 | Out-Null
    & $nssmPath set PM2 Description "PM2 Process Manager for Infometa Next.js application" 2>&1 | Out-Null
    & $nssmPath set PM2 Start SERVICE_AUTO_START 2>&1 | Out-Null
    & $nssmPath set PM2 AppStdout "C:\MyData\Business\NewProjects\anti-forgery\logs\pm2-service-out.log" 2>&1 | Out-Null
    & $nssmPath set PM2 AppStderr "C:\MyData\Business\NewProjects\anti-forgery\logs\pm2-service-err.log" 2>&1 | Out-Null
    & $nssmPath set PM2 AppDirectory "C:\MyData\Business\NewProjects\anti-forgery" 2>&1 | Out-Null
    & $nssmPath set PM2 AppEnvironmentExtra "PM2_HOME=$desiredPm2Home" 2>&1 | Out-Null
    
    Write-Host "  PM2 registered as Windows service" -ForegroundColor Green
}

# Ensure PM2 service is running
$pm2Service = Get-Service -Name "PM2" -ErrorAction SilentlyContinue
if ($pm2Service -and $pm2Service.Status -ne 'Running') {
    Start-Service PM2
    Start-Sleep -Seconds 5
}
if ($pm2Service) {
    Write-Host "  PM2 service status: $((Get-Service PM2).Status)" -ForegroundColor Green
}

# ── Phase 5: Service Recovery Config ─────────────────────────
Write-Host ""
Write-Host "[Bonus] Configuring auto-restart on failure..." -ForegroundColor Yellow

# Configure all services to auto-restart on failure (restart after 60s, 60s, 60s)
foreach ($svcName in @("PostgreSQL", "Cloudflared", "PM2")) {
    $svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
    if ($svc) {
        & sc.exe failure $svcName reset= 86400 actions= restart/60000/restart/60000/restart/60000 2>&1 | Out-Null
        Write-Host "  $svcName — auto-restart on failure configured" -ForegroundColor Green
    }
}

# ── Summary ──────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Get-Service PostgreSQL, Cloudflared, PM2 -ErrorAction SilentlyContinue | Format-Table Name, Status, StartType -AutoSize

Write-Host ""
Write-Host "All services are set to auto-start on boot." -ForegroundColor White
Write-Host "You can close VS Code and all terminals — infometa.in will stay up." -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor White
Write-Host "  Get-Service PostgreSQL, Cloudflared, PM2   — Check status" -ForegroundColor Gray
Write-Host "  Restart-Service PM2                        — Restart the app" -ForegroundColor Gray
Write-Host "  pm2 logs infometa                          — View app logs" -ForegroundColor Gray
Write-Host "  services.msc                               — Windows Services GUI" -ForegroundColor Gray
Write-Host ""
Write-Host "NEXT STEP: Reboot your laptop to verify all services auto-start." -ForegroundColor Yellow
