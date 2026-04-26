@echo off
TITLE Gerona Stall Ledger System - DO NOT CLOSE!
:: Changes the color to Red Background with Bright White Text to scream "WARNING"
COLOR 4F

echo ==========================================================
echo      CRITICAL: DO NOT CLOSE THIS WINDOW!
echo   Closing this window will shut down the entire system.
echo   Please minimize this window instead.
echo ==========================================================
echo Shoutout To My Dearest Beloved Miss
echo.

echo [1/3] Running Daily Database Backup...
call Backup-Database.bat
echo.

echo [2/3] Starting Laravel Server in the background...
:: The /B flag starts the process without opening a new command prompt window
start /B php artisan serve --host=0.0.0.0 --port=8000

echo [3/3] Starting Vite frontend in the background...
start /B npm run dev

echo.
echo ==========================================================
echo       GERONA SYSTEM IS NOW LIVE ON THE NETWORK
echo ==========================================================
echo.
echo To safely stop the servers at the end of the day, press any key...
pause >nul

:: If the user presses a key, it will cleanly kill the hidden background processes
echo.
echo Shutting down servers safely...
taskkill /F /IM php.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
echo Servers stopped. You may now close this window.
pause >nul
