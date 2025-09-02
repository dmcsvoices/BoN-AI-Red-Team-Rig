#!/bin/bash

# PromptAudit Docker Quick Start Script
echo "🚀 Starting PromptAudit with Docker..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start the services
echo "🔧 Starting services..."
if docker-compose up -d; then
    echo "✅ Services started successfully!"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    echo "🌐 Access Your Docker Application:"
    echo "   📱 Frontend:    http://localhost:60002"
    echo "   🔧 Backend API: http://localhost:8002"
    echo "   📚 API Docs:    http://localhost:8002/docs"
    echo ""
    echo "   ℹ️  Your original dev setup (8000/60000) can run alongside this"
    echo ""
    echo "📋 Useful Commands:"
    echo "   📊 Status:  docker-compose ps"
    echo "   📝 Logs:    docker-compose logs"
    echo "   🛑 Stop:    docker-compose down"
    echo ""
    echo "🎉 PromptAudit is ready for red team testing!"
else
    echo "❌ Failed to start services. Check docker-compose logs for details."
    exit 1
fi