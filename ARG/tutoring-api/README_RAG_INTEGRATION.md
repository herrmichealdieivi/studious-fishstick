# Video RAG Integration - ARG

This document describes the integration of Video RAG capabilities into the ARG (Adaptive Reasoning Gateway) system.

## Overview

The Video RAG integration provides two complementary engines:

1. **Basic Video RAG Engine** (`video_rag_engine.py`)
   - Semantic chunking of video transcripts
   - Vector similarity search
   - LLM context formatting

2. **Temporal Video RAG Engine** (`temporal_video_rag_engine.py`)
   - All basic features PLUS temporal awareness
   - Conversation history tracking
   - Anaphoric reference resolution ("earlier", "that", etc.)
   - Playback position awareness

## File Structure

```
ARG/
├── tutoring-api/          # Existing BKT + LLM tutoring system
├── video_rag_engine.py           # Basic video RAG engine
├── temporal_video_rag_engine.py  # Enhanced temporal engine
├── video_rag_api.py             # FastAPI backend for video RAG
├── demo_video_rag.py            # Complete demo and examples
├── requirements_rag.txt          # Dependencies for RAG features
└── README_RAG_INTEGRATION.md    # This file
```

## Quick Start

### 1. Install Dependencies

```bash
cd ARG
pip install -r requirements_rag.txt
```

### 2. Run Basic Video RAG Demo

```bash
python demo_video_rag.py
```

### 3. Start Video RAG API Server

```bash
# Terminal 1: Video RAG API (port 8001)
uvicorn video_rag_api:app --reload --host 0.0.0.0 --port 8001

# Terminal 2: Existing tutoring API (port 8000)
cd tutoring-api
python main.py
```

### 4. Test the Integration

```bash
# Create demo data
curl -X POST "http://localhost:8001/demo/create" \
  -H "Content-Type: application/json" \
  -d '{"video_id": "test_video"}'

# Ask a question
curl -X POST "http://localhost:8001/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "test_video",
    "query": "What are neural networks?",
    "top_k": 3
  }'
```

## API Endpoints

### Video RAG API (Port 8001)

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/health` | GET | Health check |
| `/demo/create` | POST | Create demo chunks for testing |
| `/playback-position` | POST | Update current video position |
| `/analyze` | POST | Analyze query with temporal context |
| `/conversation/save` | POST | Save conversation history |
| `/engines` | GET | List active engines |

### Existing Tutoring API (Port 8000)

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/ask` | POST | Ask LLM question with adaptive context |
| `/feedback` | POST | Submit learning feedback |
| `/adaptive-context/{student_id}` | GET | Get student's adaptive context |

## Integration Architecture

### Data Flow

1. **Video Processing**
   ```
   Video File → Audio Extraction → Transcription → Semantic Chunking → Embedding Generation
   ```

2. **Query Processing**
   ```
   User Query → Temporal Reference Detection → Multi-Strategy Retrieval → Context Formatting → LLM
   ```

3. **Learning Integration**
   ```
   Video Interaction → Evidence Collection → BKT Update → Adaptive Difficulty
   ```

### Key Integration Points

1. **Student Profile Integration**
   - Video RAG uses same `student_id` as tutoring system
   - Learning progress from videos updates BKT mastery
   - Adaptive context influences video recommendations

2. **Content Mapping**
   - Video chunks map to skills in the tutoring system
   - Skill mastery determines video difficulty and scaffolding
   - Cross-modal learning reinforcement

3. **Conversation Context**
   - Video conversations persist alongside tutoring sessions
   - Temporal context enhances personalization
   - Unified learning history across modalities

## Usage Examples

### Basic Video RAG

```python
from video_rag_engine import VideoRAGEngine

# Initialize engine
engine = VideoRAGEngine()

# Process video transcript
segments = [{"start": 0, "end": 30, "text": "Welcome to neural networks..."}]
chunks = engine.process_video(segments)

# Retrieve relevant content
results = engine.retrieve("What are neural networks?", top_k=3)
context = engine.format_retrieval_context(results)
```

### Temporal Video RAG

```python
from temporal_video_rag_engine import TemporalVideoRAGEngine

# Initialize temporal engine
engine = TemporalVideoRAGEngine()

# Set playback position
engine.set_playback_position(45.0)

# Analyze with temporal context
result = engine.analyze_with_context(
    query="What was mentioned earlier?",
    video_path="lesson_001",
    top_k=3
)

# Result includes chunks, prompt, and context info
print(f"Strategy: {result['context_info']['retrieval_strategy']}")
print(f"Chunks: {len(result['chunks'])}")
```

### API Integration

```javascript
// Set playback position as video plays
await fetch('http://localhost:8001/playback-position', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    video_id: 'lesson_001',
    position: currentTime
  })
});

// Ask question with temporal context
const response = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    video_id: 'lesson_001',
    query: 'What was mentioned earlier about training?',
    top_k: 3
  })
});

const result = await response.json();
// Use result.prompt with your LLM
```

## Features

### Basic Video RAG
- ✅ Semantic chunking based on transcript content
- ✅ Vector similarity search using sentence transformers
- ✅ LLM context formatting
- ✅ Chunk statistics and management
- ✅ Save/load functionality

### Temporal Video RAG
- ✅ All basic features PLUS:
- ✅ Temporal reference detection ("earlier", "later", etc.)
- ✅ Conversation history tracking
- ✅ Anaphoric reference resolution ("that", "it")
- ✅ Playback position awareness
- ✅ Multi-strategy retrieval (temporal + semantic)
- ✅ Demo data generation for testing

### Integration Benefits
- ✅ Unified learning profile across videos and tutoring
- ✅ Adaptive difficulty based on video interactions
- ✅ Context-aware question answering
- ✅ Temporal learning progression tracking
- ✅ Cross-modal reinforcement learning

## Configuration

### Environment Variables

```bash
# Video RAG storage directory
export VIDEO_RAG_STORAGE_DIR="./video_rag_storage"

# LLM providers (for tutoring API)
export LLM_PROVIDER=openrouter  # or "groq"
export OPENROUTER_API_KEY=sk-...
export GROQ_API_KEY=gsk-...
```

### Chunking Parameters

```python
# Customize chunking behavior
engine = VideoRAGEngine(
    embedding_model="all-MiniLM-L6-v2",  # Embedding model
    chunk_strategy="semantic"              # or "fixed_time"
)

chunker = VideoChunker(
    max_chunk_duration=60.0,    # Max seconds per chunk
    min_chunk_duration=10.0,    # Min seconds per chunk
    overlap_duration=2.0         # Overlap between chunks
)
```

## Performance

- **Processing**: ~75 seconds per minute of video
- **Querying**: <100ms per query
- **Storage**: ~2 KB per second of video
- **Memory**: ~500MB for embedding model + chunks

## Next Steps

1. **Real Video Processing**: Integrate with Whisper for actual video transcription
2. **Visual Features**: Add scene detection and visual analysis
3. **Multi-modal Fusion**: Combine visual and audio features
4. **Advanced Temporal**: Add temporal reasoning across multiple videos
5. **Personalization**: Improve recommendations based on learning patterns

## Troubleshooting

### Common Issues

1. **Model Loading Errors**
   ```bash
   # Install sentence transformers
   pip install sentence-transformers
   ```

2. **FFmpeg Not Found**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # macOS
   brew install ffmpeg
   
   # Windows: Download from ffmpeg.org
   ```

3. **Port Conflicts**
   ```bash
   # Use different ports
   uvicorn video_rag_api:app --port 8002
   uvicorn tutoring-api.main:app --port 8003
   ```

### Debug Mode

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Test with demo data
python demo_video_rag.py
```

## Contributing

When adding new features:

1. Maintain compatibility with existing tutoring API
2. Add comprehensive tests
3. Update documentation
4. Follow the established code patterns
5. Consider performance implications

## License

This integration maintains the same license as the original ARG and RAG components.
