@echo off
TITLE Gerona Stall Ledger System (LIVE) - DO NOT CLOSE!
:: Changes the color to Red Background with Bright White Text to scream "WARNING"
COLOR 4F

echo ==========================================================
echo       CRITICAL: DO NOT CLOSE THIS WINDOW!
echo   Closing this window will shut down the entire system.
echo   Please minimize this window instead.
echo ==========================================================
echo Shoutout To My Dearest Beloved Miss
echo.

for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Get-LanIp.ps1"`) do set "SERVER_IP=%%I"
if "%SERVER_IP%"=="" set "SERVER_IP=127.0.0.1"
set "APP_URL=http://%SERVER_IP%:8000"

echo [1/3] Running Daily Database Backup...
call Backup-Database.bat
echo.

echo [2/3] Optimizing System Caches (Production Mode)...
call php artisan optimize:clear >nul
call php artisan config:cache >nul
call php artisan event:cache >nul
call php artisan route:cache >nul
call php artisan view:cache >nul
echo Caches built successfully!
echo.

echo [3/3] Starting Live Network Server in the background...
:: The /B flag starts the process without opening a new command prompt window
start /B php artisan serve --host=0.0.0.0 --port=8000

echo.
echo ==========================================================
echo       GERONA SYSTEM IS NOW LIVE ON THE NETWORK
echo ==========================================================
echo.
echo Server computer URL: http://localhost:8000
echo Staff LAN URL:       http://%SERVER_IP%:8000
echo.
echo To safely stop the server at the end of the day, press any key...
pause >nul

:: If the user presses a key, it will cleanly kill the hidden background processes
echo.
echo Shutting down server safely...
taskkill /F /IM php.exe /T >nul 2>&1
echo Server stopped. You may now close this window.
pause >nul
