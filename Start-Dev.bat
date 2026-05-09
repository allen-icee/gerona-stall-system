@echo off
TITLE Gerona Stall Ledger System (DEVELOPMENT)
:: Changes the color to Blue Background with Bright White Text
COLOR 1F

echo ==========================================================
echo       DEVELOPMENT MODE (Vite + Laravel)
echo ==========================================================
echo Shoutout To My Dearest Beloved Miss
echo.

echo [1/3] Running Daily Database Backup...
call Backup-Database.bat
echo.

echo [2/3] Starting Laravel Server in the background...
start /B php artisan serve --host=0.0.0.0 --port=8000

echo [3/3] Starting Vite frontend in the background...
start /B npm run dev

echo.
echo ==========================================================
echo       DEVELOPMENT SERVERS ARE RUNNING
echo ==========================================================
echo.
echo To safely stop the servers, press any key...
pause >nul

echo.
echo Shutting down servers safely...
taskkill /F /IM php.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
echo Servers stopped. You may now close this window.
pause >nul
