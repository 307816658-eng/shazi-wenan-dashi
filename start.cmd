@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Shazi Wenan Dashi V0.1

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=C:\Users\1447987\.workbuddy\binaries\node\versions\22.22.2-3\node.exe"

if not exist ".env" (
  echo.
  echo   [ERROR] .env not found.
  echo   Copy .env.example to .env and fill in API_KEY / API_URL / MODEL_NAME.
  echo.
  pause
  exit /b 1
)

echo.
echo   Starting Shazi Wenan Dashi V0.1 ...
echo   Browser will open in 3 seconds.
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul & start "" http://localhost:3100"

"%NODE_EXE%" server.js

echo.
echo   Server stopped. Press any key to close this window.
pause >nul
