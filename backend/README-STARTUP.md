# BoN HITL MVP - Backend Startup Guide

## Quick Start

```bash
# Navigate to backend directory
cd bon-hitl-mvp/backend

# Start backend server (development mode)
./start-backend.sh

# Or on Windows
start-backend.bat
```

The backend will be available at:
- **API Server**: http://localhost:50000
- **Interactive API Docs**: http://localhost:50000/docs
- **OpenAPI Schema**: http://localhost:50000/openapi.json

## Startup Options

### Development Mode (Recommended)
```bash
./start-backend.sh
```
- Auto-reload on code changes
- Debug logging enabled
- CORS enabled for frontend
- Detailed error messages

### Production Mode
```bash
./start-backend-prod.sh
```
- Optimized performance
- Multiple worker processes
- No auto-reload
- Production logging

### Manual Commands
```bash
# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate.bat  # Windows

# Install dependencies
pip install -r requirements.txt

# Start server manually
uvicorn app.main:app --reload --host 0.0.0.0 --port 50000
```

## Dependencies

The backend uses these main packages:
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **SQLAlchemy**: Database ORM
- **Requests**: HTTP client for LLM APIs
- **Pydantic**: Data validation

## Database

- Uses SQLite database (`sessions.db`)
- Database tables created automatically on first run
- Contains sessions, prompt variants, and responses

## API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/{id}` - Get session details
- `PUT /api/sessions/{id}` - Update session
- `DELETE /api/sessions/{id}` - Delete session

### LLM Integration
- `GET /api/models/prompt-generation?base_url=<url>` - Get prompt generation models
- `GET /api/models/evaluation?base_url=<url>` - Get evaluation models  
- `POST /api/sessions/{id}/generate-prompt` - Generate attack prompt
- `POST /api/sessions/{id}/evaluate` - Evaluate response

### Expected LLM Server Endpoints
The backend expects LLM servers to support OpenAI-compatible APIs:
- `GET /v1/models` - List available models
- `POST /v1/chat/completions` - Generate text completions

## Configuration

### Default URLs
- **Prompt Generation**: `http://localhost:1234/v1`
- **Evaluation**: `http://172.27.0.93:11434/v1`

These can be configured via the frontend Settings tab or by passing `base_url` parameters to the API endpoints.

### CORS Settings
The backend allows requests from:
- `http://localhost:60000` (frontend development server)

## Troubleshooting

### Port 50000 Already in Use
```bash
# Find and kill process using port 50000
lsof -ti:50000 | xargs kill -9
```

### Virtual Environment Issues
```bash
# Remove and recreate venv
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database Issues
```bash
# Delete database to start fresh (loses all data!)
rm sessions.db
# Database will be recreated on next startup
```

### LLM Connection Issues
- Check that your LLM servers are running on the expected ports
- Verify the servers support `/v1/models` and `/v1/chat/completions`
- Check CORS settings on LLM servers if accessing directly
- Use the Settings tab in frontend to test connections

## Logs and Debugging

The backend includes detailed logging for model endpoint calls:
- Received base_url parameters
- Final constructed URLs
- Response status codes
- Response data (truncated)
- Error details

Check the console output when the frontend tries to load models to see exactly what's happening with the API calls.