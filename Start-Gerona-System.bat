@echo off
TITLE Gerona Stall Management System - Total Control
COLOR 0A

echo [1/3] Running Daily Database Backup...
call Backup-Database.bat

echo.
echo [2/3] Starting Laravel Server...
start cmd /k "title Laravel Server & php artisan serve --host=0.0.0.0 --port=8000"

echo.
echo [3/3] Starting Vite frontend...
start cmd /k "title Vite Frontend & npm run dev"

echo.
echo ===================================================
echo     GERONA SYSTEM IS NOW LIVE ON THE NETWORK
echo ===================================================
echo.
pause