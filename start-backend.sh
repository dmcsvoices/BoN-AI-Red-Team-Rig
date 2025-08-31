#!/bin/bash

# BoN HITL MVP Backend Startup Script
# This script starts the FastAPI backend server

echo "Starting BoN HITL Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f ".deps-installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch .deps-installed
fi

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Start the backend server
echo "Starting FastAPI server on http://localhost:50000"
echo "Press Ctrl+C to stop the server"
uvicorn app.main:app --reload --host 0.0.0.0 --port 50000