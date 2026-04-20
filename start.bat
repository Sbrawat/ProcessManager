@echo off
title OS Dashboard Launcher
echo ===================================================
echo   Initializing Real-Time OS Monitoring Dashboard
echo ===================================================

echo.
echo [1/3] Checking and installing Backend dependencies...
cd backend
call npm install

echo.
echo [2/3] Checking and installing Frontend dependencies...
cd ../frontend
call npm install

echo.
echo [3/3] Starting Servers...
cd ..

:: Start the Express backend in a new command prompt window
start "OS Backend" cmd /k "cd backend && npm run dev"

:: Start the Vite React frontend in a new command prompt window
start "OS Frontend" cmd /k "cd frontend && npm run dev"

:: Start the Vite React frontend in a new command prompt window
start "OS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo SUCCESS! Application servers are booting up.
echo Waiting for Vite to initialize...

:: Wait for 3 seconds silently
timeout /t 3 /nobreak > NUL

:: Open the default web browser to the dashboard
start http://localhost:5173

echo.
echo The dashboard has been opened in your browser!
echo.
pause