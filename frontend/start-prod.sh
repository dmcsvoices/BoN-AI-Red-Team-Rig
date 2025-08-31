#!/bin/bash

# BoN HITL MVP - Frontend Production Server Startup Script
# Builds and serves on port 60000

echo "🏭 Starting BoN HITL MVP Frontend (Production Mode)"
echo "📍 Port: 60000"
echo "🌐 URL: http://localhost:60000"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -s http://localhost:50000/api/health > /dev/null; then
    echo "✅ Backend is running on port 50000"
else
    echo "⚠️  Warning: Backend may not be running on port 50000"
    echo "   Make sure to start the backend server first"
    echo ""
fi

# Build the application
echo "🏗️  Building application for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Start the preview server
echo "🚀 Starting production preview server..."
echo "   - Optimized build"
echo "   - Minified assets"
echo "   - Production ready"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run preview