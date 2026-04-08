@echo off
TITLE Gerona System - Auto Backup
COLOR 0B

:: Config
set DB_NAME=gerona_stall_system
set BACKUP_DIR=./backups
set TIMESTAMP=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%_%TIME:~0,2%-%TIME:~3,2%

echo ===================================================
echo        GERONA SYSTEM: DATABASE BACKUP
echo ===================================================
echo.

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Exporting database...
:: Change 'root' and 'password' if you changed your DB credentials
mysqldump -u root gerona_stall_system > "%BACKUP_DIR%/backup_%TIMESTAMP%.sql"

echo.
echo Backup completed: %BACKUP_DIR%/backup_%TIMESTAMP%.sql
echo.
timeout /t 3