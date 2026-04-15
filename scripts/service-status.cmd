@echo off
setlocal enabledelayedexpansion
:: Infometa Service Status Check (no admin required)

set PATH=C:\pgsql\bin;C:\nodejs;C:\Program Files (x86)\cloudflared;%PATH%

echo ========================================
echo   Infometa Service Status  %date% %time%
echo ========================================
echo.
for %%S in (PostgreSQL-Infometa Cloudflared PM2 postgresql-16) do (
    sc query %%S >nul 2>&1
    if !errorlevel! equ 0 (
        for /f "tokens=4" %%A in ('sc query %%S ^| findstr STATE') do echo   %%S: %%A
    ) else (
        echo   %%S: NOT FOUND
    )
)
echo.
echo --- PostgreSQL (port 5433) ---
pg_isready -p 5433
echo.
echo --- Next.js ---
powershell -NoProfile -Command "try{$r=Invoke-WebRequest 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5; Write-Host ('  Status: '+$r.StatusCode+' OK')}catch{Write-Host ('  ERROR: '+$_.Exception.Message)}"
echo.
echo --- infometa.in ---
powershell -NoProfile -Command "try{$r=Invoke-WebRequest 'https://infometa.in' -UseBasicParsing -TimeoutSec 10; Write-Host ('  Status: '+$r.StatusCode+' OK')}catch{Write-Host ('  ERROR: '+$_.Exception.Message)}"
echo.
echo --- Health Log (last 5) ---
if exist "C:\MyData\Business\NewProjects\anti-forgery\logs\health-check.log" (
    powershell -NoProfile -Command "Get-Content 'C:\MyData\Business\NewProjects\anti-forgery\logs\health-check.log' -Tail 5"
) else (echo   No log yet)
echo.
echo --- Scheduled Task ---
schtasks /Query /TN "Infometa Health Check" /FO LIST 2>nul | findstr /C:"Status" /C:"Next Run" /C:"Last Run"
if %errorlevel% neq 0 echo   Health check task not found
echo.
echo ========================================
pause
