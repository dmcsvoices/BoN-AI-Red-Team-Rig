#!/bin/bash

# BoN HITL MVP Frontend Startup Script
# This script starts the React/Vite frontend development server

echo "Starting BoN HITL Frontend..."

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting Vite development server..."
echo "Frontend will be available at http://localhost:60000 (or next available port)"
echo "Press Ctrl+C to stop the server"
npm run dev