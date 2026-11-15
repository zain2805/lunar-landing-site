@echo off
title Lunar Landing Site Navigator - Server
echo =================================================================
echo        LUNAR LANDING SITE NAVIGATOR (NASA SPACE APPS 2026)
echo =================================================================
echo.
echo Starting Python Backend Server on Port 8000...
echo.

start "" "http://localhost:8000/"

cd backend
python server.py 8000

if %errorlevel% neq 0 (
    echo Python command failed, trying py launcher...
    py server.py 8000
)

pause
