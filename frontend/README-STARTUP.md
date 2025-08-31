# BoN HITL MVP - Frontend Startup Guide

## New Frontend Overview

The frontend has been completely rebuilt from scratch to mirror the POC1.py workflow while preserving the best elements from the current UI:

- **3-Tab Workflow**: Sessions → Prompts → Review (just like POC)
- **Attack Techniques Dropdown**: Preserved from current UI (better than POC's radio buttons)
- **Global Settings**: Configurable LLM base URLs for flexibility
- **Synthwave Theme**: Exact color scheme from POC1.py
- **Model Selection**: Two dropdowns at top for prompt generation and evaluation models

## Startup Options

### Development Mode (Recommended)
```bash
# Unix/Linux/macOS
./start-dev.sh

# Windows
start-frontend.bat

# Or directly with npm
npm run start
```
- Hot reload enabled
- Source maps for debugging
- Runs on http://localhost:60000

### Production Mode
```bash
# Unix/Linux/macOS
./start-prod.sh

# Or directly with npm
npm run build && npm run preview
```
- Optimized build
- Minified assets
- Production preview on http://localhost:60000

### Manual Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev          # Uses vite.config.js port (60000)
npm run start        # Explicit port 60000 with host binding

# Production
npm run build        # Build for production
npm run preview      # Preview production build on port 60000

# Utilities
npm run lint         # Lint the code
npm run clean        # Clean build artifacts
```

## Prerequisites

1. **Node.js** (v16 or higher) - https://nodejs.org/
2. **npm** (comes with Node.js)
3. **Backend server** running on port 8000

## Configuration

The frontend is configured to:
- Run on port **60000** (as specified)
- Connect to backend API at **http://localhost:8000**
- Use configurable LLM URLs via Settings tab:
  - Prompt Generation: `http://localhost:1234` (default, like POC)
  - Evaluation: `http://192.168.1.71:11434` (default, like POC)

## First Time Setup

1. Navigate to the frontend directory:
   ```bash
   cd bon-hitl-mvp/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend first (on port 8000)

4. Start the frontend:
   ```bash
   ./start-dev.sh
   ```

5. Open http://localhost:60000 in your browser

## Workflow Guide

1. **Settings Tab**: Configure your LLM server URLs
2. **Sessions Tab**: Create new sessions with target models and seed prompts
3. **Prompts Tab**: Generate attack prompts using various techniques
4. **Review Tab**: Evaluate target model responses for dangerous content

## Troubleshooting

- **Port 60000 in use**: Kill the process using `lsof -ti:60000 | xargs kill -9`
- **Backend not found**: Make sure backend is running on port 8000
- **LLM models not loading**: Check Settings tab and test connections
- **Build errors**: Try `npm run clean` then `npm install`

## Files Changed

- Backed up old `src/` to `src_backup_[timestamp]`
- Created completely new React components
- Updated package.json scripts
- Backend updated to support configurable LLM URLs