@echo off
REM BoN HITL MVP - Frontend Development Server Startup Script (Windows)
REM Runs on port 60000

echo 🚀 Starting BoN HITL MVP Frontend (Development Mode)
echo 📍 Port: 60000
echo 🌐 URL: http://localhost:60000
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: npm is not installed
    echo Please install npm (usually comes with Node.js)
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if backend is running
echo 🔍 Checking backend connection...
curl -s http://localhost:50000/api/health >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is running on port 50000
) else (
    echo ⚠️  Warning: Backend may not be running on port 50000
    echo    Make sure to start the backend server first
    echo.
)

REM Start the development server
echo 🔥 Starting Vite development server...
echo    - Hot reload enabled
echo    - Source maps enabled
echo    - Debug mode enabled
echo.
echo Press Ctrl+C to stop the server
echo.

npm run start