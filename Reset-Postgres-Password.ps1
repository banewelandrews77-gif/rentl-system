# Require Administrator privileges
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as Administrator. Right-click the script and select 'Run with PowerShell', or open an Admin PowerShell and run it."
    Pause
    Exit
}

$pg_hba = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-Not (Test-Path $pg_hba)) {
    Write-Error "Cannot find pg_hba.conf at $pg_hba"
    Pause
    Exit
}

Write-Host "1. Backing up pg_hba.conf to pg_hba.conf.bak" -ForegroundColor Cyan
Copy-Item $pg_hba "$pg_hba.bak" -Force

Write-Host "2. Bypassing password authentication..." -ForegroundColor Cyan
$content = Get-Content $pg_hba
$content = $content -replace '(host\s+all\s+all\s+(?:127\.0\.0\.1/32|::1/128)\s+)scram-sha-256', '${1}trust'
$content | Set-Content $pg_hba

Write-Host "3. Restarting PostgreSQL Service..." -ForegroundColor Cyan
Restart-Service postgresql-x64-18
Start-Sleep -Seconds 3

Write-Host "4. Resetting password to 'postgres'..." -ForegroundColor Cyan
& $psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

Write-Host "5. Restoring security configuration..." -ForegroundColor Cyan
$content = Get-Content $pg_hba
$content = $content -replace '(host\s+all\s+all\s+(?:127\.0\.0\.1/32|::1/128)\s+)trust', '${1}scram-sha-256'
$content | Set-Content $pg_hba

Write-Host "6. Restarting PostgreSQL Service..." -ForegroundColor Cyan
Restart-Service postgresql-x64-18
Start-Sleep -Seconds 2

Write-Host "`nSUCCESS! The password has been reset." -ForegroundColor Green
Write-Host "You can now go back to pgAdmin and enter the password 'postgres'." -ForegroundColor Yellow
Pause
