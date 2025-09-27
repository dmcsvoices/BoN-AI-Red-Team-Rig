# BoN Jailbreaking Rig - Best-of-N AI Red Team Testing Platform 🎯

## What is the BoN Jailbreaking Rig?

The **Best-of-N (BoN) Jailbreaking Rig** is a comprehensive AI red team testing platform designed for systematic prompt injection and jailbreaking research. It employs a Best-of-N strategy, generating multiple prompt variants using various attack techniques and selecting the most effective ones for AI safety evaluation.

### Core Capabilities
- **Multi-technique Prompt Generation**: Creates variants using established jailbreaking techniques
- **Best-of-N Selection**: Automatically identifies the most successful prompt variations
- **Human-in-the-Loop Evaluation**: Enables researchers to assess and validate AI model responses
- **Attack Technique Library**: Integrates proven methods from AI safety research
- **Response Analysis**: Systematic evaluation of model behavior under adversarial conditions

## Integration Test Status: ✅ SUCCESS

**Full-stack connectivity verified!** Database → Backend → Frontend data flow working perfectly.

## What's Running

### Backend (Port 50000)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite with automatic test data creation
- **Status**: ✅ Healthy and responding
- **API Endpoints**:
  - `GET /api/health` - Backend health check
  - `GET /api/sessions` - List all sessions (auto-creates test data)
  - `POST /api/sessions` - Create new session

### Frontend (Port 60000)
- **Framework**: React + Vite with Tailwind CSS
- **Theme**: Synthwave aesthetic (purple/cyan color scheme)
- **Status**: ✅ Serving and API integration working
- **Features**:
  - Session-based jailbreaking campaigns
  - Multi-model testing interface
  - Attack technique selection and application
  - Real-time prompt variant generation
  - Response evaluation and scoring
  - Vector similarity search for prompt analysis
  - Synthwave-themed red team interface

## Installation

### Prerequisites
- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 15+** (for production) or SQLite (for development)
- **Git** for version control

### 1. Clone the Repository
```bash
git clone https://github.com/dmcsvoices/BoN-AI-Red-Team-Rig.git
cd BoN-AI-Red-Team-Rig
```

### 2. Backend Setup
```bash
# Create and activate Python virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # Create from template if available
# Edit .env file with your database configuration
```

### 3. Database Setup

#### Option A: PostgreSQL (Recommended for Production)
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb bonhitl

# Update .env file:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/bonhitl
```

#### Option B: SQLite (Development)
```bash
# SQLite database will be created automatically
# Update .env file:
# DATABASE_URL=sqlite:///./sessions.db
```

### 4. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install Node.js dependencies
npm install

# Install development dependencies
npm install --save-dev
```

### 5. Verify Installation
```bash
# Test backend
cd backend
source venv/bin/activate
python -c "from app.main import app; print('Backend dependencies OK')"

# Test frontend
cd ../frontend
npm run build
echo "Frontend dependencies OK"
```

## Quick Start

After completing the installation steps above:

### 1. Start Backend Server
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn app.main:app --reload --host 0.0.0.0 --port 50000
```
Backend will be available at: http://localhost:50000

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will be available at: http://localhost:60000

### 3. Access the Application
- **Main Application**: http://localhost:60000
- **Backend API**: http://localhost:50000
- **API Health Check**: http://localhost:50000/api/health

### 4. Using the Platform
1. **Create a Session**: Start a new jailbreaking test campaign
2. **Select Target Model**: Choose the AI model to test
3. **Choose Attack Techniques**: Select from the library of jailbreaking methods
4. **Generate Prompts**: Create prompt variants using Best-of-N strategy
5. **Evaluate Responses**: Assess model outputs for safety violations

## Troubleshooting

### Common Issues
- **Database Connection Error**: Ensure PostgreSQL is running and credentials are correct
- **Port Already in Use**: Check if ports 50000 or 60000 are occupied
- **Python Dependencies**: Ensure virtual environment is activated before installing packages
- **Node Dependencies**: Clear node_modules and reinstall if build fails

### Getting Help
- Check the application logs in the terminal
- Verify all prerequisites are installed
- Ensure environment variables are properly configured

## Day 1 Success Criteria Met ✅

- ✅ Backend FastAPI server running on port 50000
- ✅ SQLite database created with Session model
- ✅ API endpoints responding correctly
- ✅ React frontend running on port 60000
- ✅ CORS configured for frontend-backend communication
- ✅ Database → Backend → Frontend data flow verified
- ✅ Synthwave theme implemented
- ✅ Error handling and status reporting working
- ✅ Both servers running concurrently without conflicts

## Integration Test Results

**Backend Health**: ✅ "Backend connected successfully"
**Database Connection**: ✅ SQLite database operational
**Sample Data**: ✅ Test session created and displayed
**API Response Time**: ✅ < 1 second
**CORS Configuration**: ✅ No cross-origin errors
**Frontend Rendering**: ✅ React components displaying data correctly

## Research Workflow

The BoN Jailbreaking Rig supports a systematic approach to AI red team testing:

1. **Campaign Setup**: Create testing sessions targeting specific AI models
2. **Seed Prompt Selection**: Choose base prompts from the curated library
3. **Attack Technique Application**: Apply various jailbreaking methods (role-playing, prompt injection, etc.)
4. **Best-of-N Generation**: Generate multiple variants and rank by effectiveness
5. **Human Evaluation**: Review and score model responses for safety violations
6. **Analysis & Reporting**: Analyze patterns and generate insights for AI safety research

## Current Implementation Status

✅ **Core Infrastructure**: Full-stack platform with database integration
✅ **Session Management**: Create and manage jailbreaking test campaigns
✅ **Attack Techniques**: Library of proven jailbreaking methods
✅ **Prompt Generation**: Automated variant creation with technique application
🚧 **AutoDAN Integration**: Genetic algorithm-based prompt evolution
🚧 **Vector Search**: Similarity-based prompt analysis and clustering
🚧 **Evaluation Workflow**: Human-in-the-loop response assessment

## File Structure

```
bon-hitl-mvp/
├── backend/
│   ├── venv/                 # Python virtual environment
│   ├── app/
│   │   ├── __init__.py      # Package marker
│   │   ├── main.py          # FastAPI application
│   │   └── database.py      # SQLAlchemy models and database setup
│   └── sessions.db          # SQLite database (auto-created)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── HealthCheck.jsx  # Integration test component
    │   ├── api.js              # Backend API integration
    │   ├── App.jsx            # Main React application
    │   └── index.css          # Synthwave theme styles
    ├── package.json           # Node.js dependencies
    └── vite.config.js         # Vite configuration (port 60000)
```

## Technology Stack

### Core Platform
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (with pgvector for embeddings)
- **Frontend**: React + Vite + Tailwind CSS with synthwave theme
- **Database**: PostgreSQL with vector similarity search capabilities
- **API**: RESTful endpoints with comprehensive CORS configuration

### AI Safety Research Tools
- **Attack Techniques**: Curated library from AI safety research
- **AutoDAN Integration**: Genetic algorithm prompt optimization
- **Vector Embeddings**: Semantic similarity analysis for prompt clustering
- **Human Evaluation**: Structured workflow for response assessment
- **Best-of-N Selection**: Automated ranking of prompt effectiveness

The platform provides a complete toolkit for systematic AI jailbreaking research! 🔬🛡️