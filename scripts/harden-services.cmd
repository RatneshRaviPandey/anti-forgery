@echo off
:: Infometa Infrastructure Hardening Script
:: Run as Administrator (right-click -> Run as administrator)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Run as Administrator!
    pause
    exit /b 1
)

set LOGFILE=C:\tools\hardening.log
if not exist C:\tools mkdir C:\tools
echo === %date% %time% === > %LOGFILE%

echo ========================================
echo   Infometa Service Hardening
echo ========================================
echo.

:: 1. Disable old postgresql-16 service (port 5432, unused)
echo [1/3] Disabling old postgresql-16 service...
sc query postgresql-16 >nul 2>&1
if %errorlevel% equ 0 (
    net stop postgresql-16 >nul 2>&1
    timeout /t 3 /nobreak >nul
    sc config postgresql-16 start= disabled >> %LOGFILE% 2>&1
    echo   Stopped and set to Disabled
    echo   postgresql-16 stopped and disabled >> %LOGFILE%
) else (
    echo   Not found, skipping
    echo   postgresql-16 not found >> %LOGFILE%
)

:: 2. Set PM2 dependency on PostgreSQL-Infometa
echo [2/3] Setting PM2 to start after PostgreSQL-Infometa...
C:\tools\nssm\nssm.exe set PM2 DependOnService PostgreSQL-Infometa >> %LOGFILE% 2>&1
echo   PM2 now depends on PostgreSQL-Infometa
echo   PM2 dependency set >> %LOGFILE%

:: 3. Create health-check scheduled task (every 5 min)
echo [3/3] Creating health-check scheduled task...
schtasks /Delete /TN "Infometa Health Check" /F >nul 2>&1
schtasks /Create /TN "Infometa Health Check" /TR "powershell.exe -ExecutionPolicy Bypass -NoProfile -File \"C:\MyData\Business\NewProjects\anti-forgery\scripts\health-check.ps1\"" /SC MINUTE /MO 5 /RU SYSTEM /RL HIGHEST /F >> %LOGFILE% 2>&1
if %errorlevel% equ 0 (
    echo   Health check task created: every 5 minutes
    echo   Scheduled task created OK >> %LOGFILE%
) else (
    echo   WARNING: Task creation error %errorlevel%
    echo   Task creation error >> %LOGFILE%
)

:: Summary
echo.
echo ========================================
echo   Summary
echo ========================================
echo.
echo   [1] postgresql-16 (old, port 5432): DISABLED
echo   [2] PM2 depends on PostgreSQL-Infometa: SET
echo   [3] Health check every 5 min: CREATED
echo.
echo   Current services:
sc query PostgreSQL-Infometa | findstr STATE
sc query Cloudflared | findstr STATE
sc query PM2 | findstr STATE
echo.
schtasks /Query /TN "Infometa Health Check" /FO TABLE /NH 2>nul
echo.

echo. >> %LOGFILE%
echo === SUMMARY === >> %LOGFILE%
sc query PostgreSQL-Infometa | findstr STATE >> %LOGFILE%
sc query Cloudflared | findstr STATE >> %LOGFILE%
sc query PM2 | findstr STATE >> %LOGFILE%
echo === DONE === >> %LOGFILE%

echo   Log: %LOGFILE%
echo.
pause
