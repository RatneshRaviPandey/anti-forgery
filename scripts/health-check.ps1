# Infometa Health Check — Runs every 5 min via Task Scheduler
# Checks all services, restarts any that are down, logs only issues + hourly heartbeat

$logFile = "C:\MyData\Business\NewProjects\anti-forgery\logs\health-check.log"
$logDir = Split-Path $logFile
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$issues = @()

# Check services are running
foreach ($svcName in @("PostgreSQL-Infometa", "PM2", "Cloudflared")) {
    $svc = Get-Service $svcName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -ne 'Running') {
        $issues += "$svcName was $($svc.Status) - restarting"
        Start-Service $svcName -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5
    }
}

# Deep check: PostgreSQL accepting connections
$env:PATH = "C:\pgsql\bin;" + $env:PATH
$pgReady = & pg_isready -p 5433 2>&1 | Out-String
if ($pgReady -notlike "*accepting*") {
    $issues += "pg_isready failed - restarting PostgreSQL-Infometa"
    Restart-Service PostgreSQL-Infometa -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5
    Restart-Service PM2 -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5
}

# Deep check: Next.js responding
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -ne 200) {
        $issues += "localhost:3000 returned $($r.StatusCode) - restarting PM2"
        Restart-Service PM2 -ErrorAction SilentlyContinue
    }
} catch {
    $issues += "localhost:3000 unreachable - restarting PM2"
    Restart-Service PM2 -ErrorAction SilentlyContinue
}

# Log only issues + hourly heartbeat
if ($issues.Count -gt 0) {
    $entry = "[$timestamp] ISSUES FOUND:"
    foreach ($issue in $issues) { $entry += "`n  - $issue" }
    Add-Content -Path $logFile -Value "$entry`n"
} elseif ((Get-Date).Minute -lt 5) {
    Add-Content -Path $logFile -Value "[$timestamp] OK - all services healthy"
}

# Trim log if over 1MB
if ((Test-Path $logFile) -and (Get-Item $logFile).Length -gt 1MB) {
    Set-Content -Path $logFile -Value (Get-Content $logFile -Tail 500)
}
