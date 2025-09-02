#!/bin/bash

# BoN HITL MVP Complete Startup Script
# This script starts both backend and frontend servers

echo "Starting BoN HITL MVP - Backend and Frontend"
echo "============================================"

# Function to handle cleanup on script exit
cleanup() {
    echo -e "\nShutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup background processes on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "Starting backend server..."
./start-backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
./start-frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting up!"
echo "📱 Frontend: http://localhost:60000 (or next available port)"
echo "🔧 Backend API: http://localhost:50000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait