#!/bin/bash

# BoN HITL MVP - Native Frontend Startup
# React + Vite on port 60000

echo "🎨 Starting BoN HITL Frontend (Native)"
echo "📍 Port: 60000"
echo "🎭 Theme: Synthwave"
echo ""

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "✅ Starting React dev server..."
echo "   Frontend: http://localhost:60000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev