#!/bin/bash

# BoN HITL MVP - Native Backend Startup
# PostgreSQL + FastAPI on port 50000

echo "🚀 Starting BoN HITL Backend (Native)"
echo "📍 Port: 50000"
echo "🗄️ Database: PostgreSQL + pgvector"
echo ""

# Check PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "⚠️  PostgreSQL not running, starting..."
    brew services start postgresql@17
    sleep 3
fi

# Verify database exists
psql postgres -c "SELECT 1 FROM pg_database WHERE datname = 'bonhitl';" | grep -q 1 || {
    echo "📝 Creating bonhitl database..."
    psql postgres -c "CREATE DATABASE bonhitl;"
    psql bonhitl -c "CREATE EXTENSION IF NOT EXISTS vector;"
}

cd backend

# Setup virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Set native PostgreSQL connection
export DATABASE_URL="postgresql://$(whoami)@localhost:5432/bonhitl"

echo "✅ Starting FastAPI server..."
echo "   Backend: http://localhost:50000"
echo "   API Docs: http://localhost:50000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 50000