# Infometa — Daily PostgreSQL Backup Script
# Schedule this with Windows Task Scheduler to run daily at 2 AM
# schtasks /create /tn "Infometa DB Backup" /tr "powershell -File C:\MyData\Business\NewProjects\anti-forgery\scripts\backup-db.ps1" /sc daily /st 02:00

$env:PATH = "C:\pgsql\bin;C:\nodejs;" + $env:PATH
$env:PGPASSWORD = "Infometa2026!"

$backupDir = "C:\MyData\Business\NewProjects\anti-forgery\backups"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$backupFile = "$backupDir\infometa_$timestamp.sql"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }

# Dump the database
Write-Host "[$timestamp] Starting backup..."
pg_dump -U postgres -h localhost -p 5433 -d infometa -F c -f "$backupFile.dump" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[$timestamp] Backup successful: $backupFile.dump"
    
    # Keep only the last 14 backups (2 weeks)
    $allBackups = Get-ChildItem $backupDir -Filter "infometa_*.dump" | Sort-Object CreationTime -Descending
    if ($allBackups.Count -gt 14) {
        $allBackups | Select-Object -Skip 14 | Remove-Item -Force
        Write-Host "[$timestamp] Cleaned old backups. Keeping last 14."
    }
} else {
    Write-Host "[$timestamp] BACKUP FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
}
