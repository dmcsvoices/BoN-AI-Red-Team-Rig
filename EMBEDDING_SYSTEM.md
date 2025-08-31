# Embedding Generation System ✅

The BoN HITL MVP now includes a complete embedding generation system for vector similarity search capabilities.

## Overview

**Problem Solved**: Generate vector embeddings for prompts and responses without interrupting the main application's model usage, since the LLM backend can only run one model at a time.

**Solution**: Asynchronous embedding queue with scheduled processing during off-peak hours (6AM and 11PM by default).

## System Components

### 1. Settings Configuration ⚙️
**Location**: Settings Tab in Frontend

**New Settings Added**:
- **Embedding Server URL**: Often same as prompt generation server
- **Embedding Model**: Selectable models (text-embedding-3-small, nomic-embed-text, etc.)
- **Processing Schedule**: Two daily times for automatic processing
- **Enable/Disable Queue**: Toggle automatic embedding generation

**Connection Testing**: Verifies embedding server accessibility

### 2. Database Schema 🗄️
**New Fields Added to All Tables**:

```sql
-- Sessions Table
seed_prompt_embedding vector(1536)     -- Vector for similarity search
embedding_status VARCHAR               -- pending, processing, completed, failed
embedding_generated_at TIMESTAMP      -- When embedding was created

-- PromptVariants Table  
text_embedding vector(1536)           -- Vector for prompt similarity
embedding_status VARCHAR              
embedding_generated_at TIMESTAMP      

-- Responses Table
response_embedding vector(1536)       -- Vector for response similarity
embedding_status VARCHAR              
embedding_generated_at TIMESTAMP      
```

**Automatic Migration**: New fields are added automatically when backend starts

### 3. API Endpoints 🔌

**`POST /api/embeddings/generate`**
- Processes pending embeddings in batches
- Supports custom embedding URL, model, and batch size
- Returns processing results with error details

**`GET /api/embeddings/status`** 
- Returns count of pending, processing, and completed embeddings
- Shows whether embedding generation is currently active

**`POST /api/embeddings/reset-failed`**
- Resets failed embeddings back to pending status
- Useful for retry after fixing configuration issues

### 4. Scheduled Processing 📅
**Location**: `embedding_scheduler.py`

**Features**:
- **macOS Integration**: Uses launchd for system-level scheduling
- **Configurable Times**: Default 6AM and 11PM (configurable in Settings)
- **Conflict Avoidance**: Only runs when main app isn't using the model
- **Graceful Handling**: Skips if backend unavailable or already processing
- **Comprehensive Logging**: Detailed logs for monitoring and debugging

**Setup Commands**:
```bash
# Setup automatic scheduling
python3 embedding_scheduler.py --setup

# Check current status
python3 embedding_scheduler.py --status

# Manual run (force)
python3 embedding_scheduler.py --force
```

## Workflow

### 1. Data Creation
- **Sessions**: New sessions get `embedding_status = "pending"`
- **Prompt Variants**: Generated prompts marked as pending
- **Responses**: Target responses marked for embedding

### 2. Queue Processing
- **Scheduled Times**: Automatic processing at 6AM and 11PM
- **Batch Processing**: Processes multiple items efficiently  
- **Status Tracking**: Updates status through pending → processing → completed
- **Error Handling**: Failed items marked as "failed" for retry

### 3. Vector Storage
- **1536 Dimensions**: Compatible with OpenAI embedding models
- **pgvector Integration**: Efficient vector storage and similarity search
- **Indexed**: Automatic IVFFlat indexes for fast similarity queries

## Usage Examples

### Frontend Integration
```javascript
// Settings are automatically saved and used by scheduler
const settings = {
  embeddingUrl: 'http://localhost:1234/v1',
  embeddingModel: 'text-embedding-3-small',
  embeddingSchedule1: '06:00',
  embeddingSchedule2: '23:00',
  enableEmbeddingQueue: true
};
```

### Manual Processing
```bash
# Force embedding generation now
curl -X POST http://localhost:50000/api/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "embedding_url": "http://localhost:1234/v1",
    "embedding_model": "text-embedding-3-small",
    "batch_size": 10
  }'
```

### Status Monitoring
```bash
# Check queue status
curl http://localhost:50000/api/embeddings/status

# Response:
{
  "pending": {"total": 15},
  "processing": {"total": 0}, 
  "completed": {"total": 142},
  "is_processing": false
}
```

## Vector Similarity Features

Once embeddings are generated, you can implement:

### 1. Similar Prompt Search
```sql
SELECT id, text, 
       1 - (text_embedding <=> :query_embedding) as similarity
FROM prompt_variants 
WHERE embedding_status = 'completed'
ORDER BY text_embedding <=> :query_embedding
LIMIT 10;
```

### 2. Response Clustering
```sql
SELECT session_id, COUNT(*) as similar_responses
FROM responses r1
WHERE EXISTS (
  SELECT 1 FROM responses r2 
  WHERE r1.response_embedding <=> r2.response_embedding < 0.1
  AND r1.id != r2.id
)
GROUP BY session_id;
```

### 3. Attack Technique Analysis
```sql
-- Find prompts similar to successful attacks
SELECT pv.*, s.name as session_name
FROM prompt_variants pv
JOIN sessions s ON pv.session_id = s.id  
JOIN responses r ON r.prompt_variant_id = pv.id
WHERE r.is_dangerous = true
  AND pv.text_embedding <=> :target_embedding < 0.2
ORDER BY pv.text_embedding <=> :target_embedding;
```

## Conflict Resolution

### During Scheduled Times
- **User Requests**: Will timeout gracefully if embedding generation is active
- **Status Indicators**: UI shows "Embedding generation in progress" 
- **Smart Scheduling**: Skips run if main app is actively using models

### Resource Management
- **Single Model Access**: Only one process uses the model at a time
- **Queue Persistence**: Pending items remain until processed
- **Retry Logic**: Failed embeddings can be reset and retried

## Benefits

✅ **Non-Blocking**: Main app functions aren't interrupted  
✅ **Automatic**: Runs without user intervention  
✅ **Scalable**: Batch processing handles large datasets  
✅ **Robust**: Error handling and retry mechanisms  
✅ **Configurable**: User controls schedule and settings  
✅ **Efficient**: Vector indexes for fast similarity search  

## Monitoring & Maintenance

### Logs Location
```bash
logs/embedding_scheduler.log          # Main scheduler log
logs/embedding_scheduler_error.log    # Error-specific log
```

### Health Checks
1. Check embedding queue status via API
2. Monitor scheduler logs for errors
3. Verify backend connectivity during scheduled times
4. Review failed embedding counts

### Troubleshooting
- **No Embeddings Generated**: Check model server availability
- **Schedule Not Working**: Verify launchd registration
- **High Failed Count**: Check embedding model compatibility
- **Performance Issues**: Adjust batch size in settings

The embedding system provides powerful vector similarity search capabilities while ensuring the main application remains responsive and functional.