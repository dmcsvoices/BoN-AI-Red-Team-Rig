#!/bin/bash

# BoN HITL MVP - Backend Server Startup Script
# FastAPI server on port 50000

echo "🚀 Starting BoN HITL MVP Backend"
echo "📍 Port: 50000"
echo "🌐 API Base URL: http://localhost:50000"
echo "📖 API Docs: http://localhost:50000/docs"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Error: Python is not installed"
        echo "Please install Python 3.8+ from https://python.org/"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "🐍 Using Python: $(which $PYTHON_CMD)"
$PYTHON_CMD --version

# Check if we're in the right directory
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: app/main.py not found"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found"
    exit 1
fi

# Install/upgrade dependencies
echo "📦 Installing/updating dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check database
echo "🗄️  Checking database..."
if [ -f "sessions.db" ]; then
    echo "✅ Database found: sessions.db"
else
    echo "📝 Database will be created automatically"
fi

# Start the server
echo "🔥 Starting FastAPI server with Uvicorn..."
echo "   - Auto-reload enabled"
echo "   - CORS enabled for frontend"
echo "   - Debug logging enabled"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 50000