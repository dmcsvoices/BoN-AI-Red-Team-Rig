@echo off
REM BoN HITL MVP - Backend Server Startup Script (Windows)
REM FastAPI server on port 50000

echo 🚀 Starting BoN HITL MVP Backend
echo 📍 Port: 50000
echo 🌐 API Base URL: http://localhost:50000
echo 📖 API Docs: http://localhost:50000/docs
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python
) else (
    where python3 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set PYTHON_CMD=python3
    ) else (
        echo ❌ Error: Python is not installed
        echo Please install Python 3.8+ from https://python.org/
        pause
        exit /b 1
    )
)

echo 🐍 Using Python: %PYTHON_CMD%
%PYTHON_CMD% --version

REM Check if we're in the right directory
if not exist "app\main.py" (
    echo ❌ Error: app\main.py not found
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    %PYTHON_CMD% -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
if not exist "requirements.txt" (
    echo ❌ Error: requirements.txt not found
    pause
    exit /b 1
)

REM Install/upgrade dependencies
echo 📦 Installing/updating dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check database
echo 🗄️  Checking database...
if exist "sessions.db" (
    echo ✅ Database found: sessions.db
) else (
    echo 📝 Database will be created automatically
)

REM Start the server
echo 🔥 Starting FastAPI server with Uvicorn...
echo    - Auto-reload enabled
echo    - CORS enabled for frontend
echo    - Debug logging enabled
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 50000