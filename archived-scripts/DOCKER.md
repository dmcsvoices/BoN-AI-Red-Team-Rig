# PromptAudit Docker Setup

This document explains how to run PromptAudit using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## Quick Start

### 1. Clone and Navigate
```bash
cd bon-hitl-mvp
```

### 2. Build and Start Services
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### 3. Access the Application
- **Docker Frontend**: http://localhost:60002 (port 60002)
- **Docker Backend API**: http://localhost:8002
- **Docker API Documentation**: http://localhost:8002/docs

*Note: These ports are separate from your original development setup (8000/60000) to avoid conflicts*

## Docker Commands

### Basic Operations
```bash
# Start services (after first build)
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend

# Restart a service
docker-compose restart backend
```

### Development Commands
```bash
# Rebuild a specific service
docker-compose build backend
docker-compose build frontend

# Force rebuild (no cache)
docker-compose build --no-cache

# Scale services (if needed)
docker-compose up --scale backend=2

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Maintenance Commands
```bash
# View running containers
docker-compose ps

# View resource usage
docker stats

# Clean up unused Docker resources
docker system prune

# Remove all stopped containers, networks, images
docker system prune -a
```

## File Structure

```
bon-hitl-mvp/
├── docker-compose.yml          # Main orchestration file
├── backend/
│   ├── Dockerfile             # Backend container config
│   ├── .dockerignore         # Backend build exclusions
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── Dockerfile            # Frontend container config
│   ├── .dockerignore        # Frontend build exclusions
│   ├── nginx.conf           # Nginx configuration
│   └── package.json         # Node.js dependencies
└── DOCKER.md                # This documentation
```

## Service Details

### Backend Service
- **Container**: `promptaudit-backend`
- **Host Port**: 50000 → **Container Port**: 8000
- **Framework**: FastAPI with Python 3.11
- **Database**: SQLite (persistent volume)
- **Health Check**: `GET /api/health`

### Frontend Service  
- **Container**: `promptaudit-frontend`
- **Host Port**: 60000 → **Container Port**: 80
- **Framework**: React + Vite + Nginx
- **Routing**: SPA with nginx fallback
- **API Proxy**: `/api/*` → `backend:8000/api/*`

## Persistent Data

Database data is stored in a Docker volume (`backend_data`) and will persist across container restarts.

### Backup Database
```bash
# Create backup
docker-compose exec backend cp /app/data/promptaudit.db /app/data/backup_$(date +%Y%m%d_%H%M%S).db

# Copy backup to host
docker cp promptaudit-backend:/app/data/backup_*.db ./
```

### Restore Database
```bash
# Copy backup to container
docker cp ./backup_file.db promptaudit-backend:/app/data/promptaudit.db

# Restart backend to pick up changes
docker-compose restart backend
```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using port 80/8000
lsof -i :80
lsof -i :8000

# Change ports in docker-compose.yml if needed
```

**2. Container Won't Start**
```bash
# Check logs
docker-compose logs [service_name]

# Check container status
docker-compose ps
```

**3. Database Issues**
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up --build
```

**4. Frontend Can't Connect to Backend**
```bash
# Check network connectivity
docker-compose exec frontend ping backend

# Check backend health
curl http://localhost:8000/health
```

### Development Debugging

**Enter Container Shell**
```bash
# Backend (Python/bash)
docker-compose exec backend bash

# Frontend (Alpine/sh)  
docker-compose exec frontend sh
```

**View Container Filesystem**
```bash
# List files in backend container
docker-compose exec backend ls -la /app

# List files in frontend container
docker-compose exec frontend ls -la /usr/share/nginx/html
```

**Monitor Resource Usage**
```bash
# Real-time stats
docker stats promptaudit-backend promptaudit-frontend

# Container resource limits
docker-compose exec backend cat /proc/meminfo
```

## Production Deployment

### Environment Variables
Create a `.env` file:
```env
# Production settings
DATABASE_PATH=/app/data/promptaudit.db
CORS_ORIGINS=https://yourdomain.com
API_HOST=0.0.0.0
API_PORT=8000
```

### SSL/HTTPS Setup
Uncomment the `nginx-proxy` service in `docker-compose.yml` and:
1. Add SSL certificates to `./ssl/` directory
2. Configure `nginx-proxy.conf` with your domain
3. Update ports as needed

### Performance Tuning
```yaml
# In docker-compose.yml, add resource limits:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Security Considerations

1. **Change default ports** for production
2. **Use environment variables** for sensitive data
3. **Enable SSL/TLS** with reverse proxy
4. **Restrict network access** with firewall rules
5. **Regular updates** of base images
6. **Monitor logs** for security events

## Updates

### Update Application Code
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up --build -d
```

### Update Base Images
```bash
# Pull latest base images
docker-compose pull

# Rebuild with latest images
docker-compose build --no-cache
docker-compose up -d
```

## Support

For issues related to:
- **Docker setup**: Check this documentation and troubleshooting section
- **Application bugs**: Check application logs with `docker-compose logs`
- **Performance**: Monitor with `docker stats` and adjust resource limits