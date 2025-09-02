#!/bin/bash

# PromptAudit Docker Test Script
echo "🐳 Testing PromptAudit Docker Setup..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose is available"

# Validate configuration
echo "🔍 Validating Docker Compose configuration..."
if docker-compose config --quiet; then
    echo "✅ Docker Compose configuration is valid"
else
    echo "❌ Docker Compose configuration has errors"
    exit 1
fi

# Test build (optional - can take a while)
read -p "🏗️  Do you want to test build? This may take several minutes. (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Building Docker images..."
    if docker-compose build; then
        echo "✅ Docker build successful"
    else
        echo "❌ Docker build failed"
        exit 1
    fi
fi

# Test startup (optional)
read -p "🚀 Do you want to test startup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting services..."
    if docker-compose up -d; then
        echo "✅ Services started successfully"
        echo ""
        echo "📊 Service Status:"
        docker-compose ps
        echo ""
        echo "🌐 Access Points:"
        echo "   Frontend: http://localhost"
        echo "   Backend:  http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
        echo ""
        echo "📋 To view logs: docker-compose logs"
        echo "📋 To stop: docker-compose down"
    else
        echo "❌ Failed to start services"
        exit 1
    fi
else
    echo "🎉 Docker setup is ready!"
    echo ""
    echo "📋 Quick Start Commands:"
    echo "   Build:  docker-compose build"
    echo "   Start:  docker-compose up -d"
    echo "   Logs:   docker-compose logs"
    echo "   Stop:   docker-compose down"
    echo ""
    echo "📚 See DOCKER.md for complete documentation"
fi