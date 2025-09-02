#!/bin/bash

# BoN HITL MVP - Complete Native Startup
# Starts both PostgreSQL, Backend, and Frontend

echo "🎯 Starting BoN HITL MVP (Native Mode)"
echo "============================================"
echo "🗄️ Database: Native PostgreSQL + pgvector"  
echo "🔧 Backend: FastAPI on port 50000"
echo "🎨 Frontend: React on port 60000"
echo ""

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

# Wait for backend to start
sleep 5

# Start frontend in background  
echo "Starting frontend server..."
./start-frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "🌐 Frontend: http://localhost:60000"
echo "🔧 Backend API: http://localhost:50000"
echo "📖 API Docs: http://localhost:50000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait