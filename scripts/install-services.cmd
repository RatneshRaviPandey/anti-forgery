@echo off
:: Infometa Service Installer - Run as Administrator
:: Right-click this file -> "Run as administrator"

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click the file and select "Run as administrator"
    pause
    exit /b 1
)

echo ========================================
echo   Infometa Service Installation
echo ========================================
echo.

set LOGFILE=C:\tools\service-install.log
if not exist C:\tools mkdir C:\tools
echo === %date% %time% === > %LOGFILE%

:: ── Phase 1: System PATH ──
echo [1/5] Updating system PATH...
echo Phase 1: System PATH >> %LOGFILE%

:: Add C:\nodejs to system PATH if missing
echo %PATH% | findstr /C:"C:\nodejs" >nul
if %errorlevel% neq 0 (
    setx PATH "C:\nodejs;C:\pgsql\bin;%PATH%" /M >nul 2>&1
    set "PATH=C:\nodejs;C:\pgsql\bin;%PATH%"
    echo   Added C:\nodejs and C:\pgsql\bin to system PATH
    echo Added C:\nodejs, C:\pgsql\bin to system PATH >> %LOGFILE%
) else (
    echo   PATH already configured
    echo PATH already configured >> %LOGFILE%
)

set "PATH=C:\Program Files (x86)\cloudflared;C:\pgsql\bin;C:\nodejs;C:\Program Files\Git\bin;%PATH%"

:: ── Phase 2: Set PM2_HOME system-wide ──
echo [2/5] Setting PM2_HOME system variable...
setx PM2_HOME "C:\Users\Admin\.pm2" /M >nul 2>&1
set PM2_HOME=C:\Users\Admin\.pm2
echo   PM2_HOME=C:\Users\Admin\.pm2
echo PM2_HOME set >> %LOGFILE%

:: ── Phase 3: Install Cloudflare Tunnel service ──
echo [3/5] Installing Cloudflare Tunnel service...
echo Phase 3: Cloudflare Tunnel >> %LOGFILE%

sc query Cloudflared >nul 2>&1
if %errorlevel% equ 0 (
    echo   Cloudflared service already exists
    echo Cloudflared service already exists >> %LOGFILE%
) else (
    :: Kill any manual cloudflared process
    taskkill /F /IM cloudflared.exe >nul 2>&1
    timeout /t 3 /nobreak >nul
    
    cloudflared service install 2>> %LOGFILE%
    if %errorlevel% equ 0 (
        echo   Cloudflared service installed successfully
        echo Cloudflared installed OK >> %LOGFILE%
    ) else (
        echo   WARNING: cloudflared service install returned error - checking...
        echo Cloudflared install returned error >> %LOGFILE%
    )
)

:: Start cloudflared service
sc query Cloudflared >nul 2>&1
if %errorlevel% equ 0 (
    net start Cloudflared >nul 2>&1
    echo   Cloudflared service started
    echo Cloudflared started >> %LOGFILE%
)

:: ── Phase 4: Download NSSM ──
echo [4/5] Setting up PM2 service...
echo Phase 4: PM2 service >> %LOGFILE%

sc query PM2 >nul 2>&1
if %errorlevel% equ 0 (
    echo   PM2 service already exists
    echo PM2 service already exists >> %LOGFILE%
    goto :phase5
)

if not exist C:\tools\nssm\nssm.exe (
    echo   Downloading NSSM service wrapper...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; New-Item -ItemType Directory -Path 'C:\tools\nssm' -Force | Out-Null; Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'C:\tools\nssm\nssm.zip' -UseBasicParsing; Expand-Archive -Path 'C:\tools\nssm\nssm.zip' -DestinationPath 'C:\tools\nssm\temp' -Force; Copy-Item 'C:\tools\nssm\temp\nssm-2.24\win64\nssm.exe' 'C:\tools\nssm\nssm.exe' -Force; Remove-Item 'C:\tools\nssm\temp' -Recurse -Force; Remove-Item 'C:\tools\nssm\nssm.zip' -Force"
    if exist C:\tools\nssm\nssm.exe (
        echo   NSSM downloaded successfully
        echo NSSM downloaded >> %LOGFILE%
    ) else (
        echo   ERROR: NSSM download failed!
        echo NSSM download FAILED >> %LOGFILE%
        goto :phase5
    )
) else (
    echo   NSSM already available
)

:: Install PM2 service
echo   Creating PM2 Windows service...
C:\tools\nssm\nssm.exe install PM2 "C:\nodejs\node.exe" "C:\nodejs\node_modules\pm2\bin\pm2 resurrect --no-daemon"
C:\tools\nssm\nssm.exe set PM2 DisplayName "PM2 Process Manager"
C:\tools\nssm\nssm.exe set PM2 Description "PM2 - Infometa Next.js production server"
C:\tools\nssm\nssm.exe set PM2 Start SERVICE_AUTO_START
C:\tools\nssm\nssm.exe set PM2 AppDirectory "C:\MyData\Business\NewProjects\anti-forgery"
C:\tools\nssm\nssm.exe set PM2 AppEnvironmentExtra PM2_HOME=C:\Users\Admin\.pm2 NODE_ENV=production PATH=C:\nodejs;C:\pgsql\bin;C:\Program Files (x86)\cloudflared;C:\WINDOWS\system32;C:\WINDOWS
C:\tools\nssm\nssm.exe set PM2 AppStdout "C:\MyData\Business\NewProjects\anti-forgery\logs\pm2-service.log"
C:\tools\nssm\nssm.exe set PM2 AppStderr "C:\MyData\Business\NewProjects\anti-forgery\logs\pm2-service-err.log"
C:\tools\nssm\nssm.exe set PM2 AppRotateFiles 1
C:\tools\nssm\nssm.exe set PM2 AppRotateBytes 5242880

:: Create logs dir
if not exist C:\MyData\Business\NewProjects\anti-forgery\logs mkdir C:\MyData\Business\NewProjects\anti-forgery\logs

:: Stop any existing PM2 processes first
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq PM2*" >nul 2>&1

:: Start PM2 service
net start PM2 >nul 2>&1
timeout /t 5 /nobreak >nul
echo   PM2 service installed and started
echo PM2 installed and started >> %LOGFILE%

:phase5
:: ── Phase 5: Service Recovery ──
echo [5/5] Configuring auto-restart on failure...
echo Phase 5: Recovery >> %LOGFILE%

sc failure postgresql-16 reset= 86400 actions= restart/60000/restart/60000/restart/60000 >nul 2>&1
sc failure Cloudflared reset= 86400 actions= restart/60000/restart/60000/restart/60000 >nul 2>&1
sc failure PM2 reset= 86400 actions= restart/60000/restart/60000/restart/60000 >nul 2>&1
echo   Recovery policies configured for all services

:: ── Summary ──
echo.
echo ========================================
echo   Summary
echo ========================================

echo.
echo Checking services...

sc query postgresql-16 | findstr STATE
sc query Cloudflared | findstr STATE 2>nul
sc query PM2 | findstr STATE 2>nul

echo.

:: Write summary to log
echo. >> %LOGFILE%
echo === SUMMARY === >> %LOGFILE%
sc query postgresql-16 | findstr STATE >> %LOGFILE%
sc query Cloudflared | findstr STATE >> %LOGFILE% 2>&1
sc query PM2 | findstr STATE >> %LOGFILE% 2>&1
echo === DONE === >> %LOGFILE%

echo ========================================
echo   Installation complete!
echo ========================================
echo.
echo All services are set to auto-start on boot.
echo You can close VS Code - infometa.in will stay up.
echo.
echo Log saved to: %LOGFILE%
echo.
pause
