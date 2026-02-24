# ARG — Adaptive Reasoning Gateway with Video RAG Integration

**ARG** is comprehensive RAG (Retrieval-Augmented Generation) implementation for Mentorium, now enhanced with Video RAG capabilities.

## Features

### Core Components
- **BKT Engine**: Bayesian Knowledge Tracing for adaptive learning
- **LLM Integration**: Cost-effective providers (OpenRouter, Groq)
- **Video RAG**: Semantic video content analysis and retrieval
- **Temporal Awareness**: Time-aware question answering
- **Adaptive Learning**: Personalized difficulty and scaffolding

### Video RAG Integration
- **Semantic Chunking**: Intelligent video content segmentation
- **Temporal Context**: Understands "earlier", "later", "that part"
- **Conversation History**: Maintains context across interactions
- **Multi-Modal Learning**: Combines video and text-based learning

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARG SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│  Tutoring API (Port 8000)                                │
│  ├── BKT Engine (MARE integration)                        │
│  ├── LLM Providers (OpenRouter/Groq)                       │
│  ├── Adaptive Learning System                               │
│  └── Video RAG Endpoints                                 │
├─────────────────────────────────────────────────────────────────┤
│  Video RAG Engine                                         │
│  ├── Semantic Chunking                                     │
│  ├── Temporal Awareness                                   │
│  ├── Conversation History                                 │
│  └── Vector Similarity Search                             │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd ARG
# Core tutoring system
pip install -r tutoring-api/requirements.txt

# Video RAG features (optional)
pip install -r requirements_rag.txt
```

### 2. Environment Setup

```bash
# LLM Provider
export LLM_PROVIDER=openrouter  # or "groq"
export OPENROUTER_API_KEY=sk-...
export GROQ_API_KEY=gsk-...

# Video RAG Storage
export VIDEO_RAG_STORAGE_DIR="./video_rag_storage"
```

### 3. Run·System

```bash
# Start the main tutoring API with Video RAG integration
cd tutoring-api
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Core Tutoring Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/ask` | POST | Ask LLM question with adaptive context |
| `/feedback` | POST | Submit learning feedback |
| `/adaptive-context/{student_id}` | GET | Get student's adaptive context |
| `/skill/{student_id}/{skill_id}` | GET | Get skill progress |
| `/health` | GET | System health check |

### Video RAG Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/video/demo/create` | POST | Create demo video data |
| `/video/playback-position` | POST | Update video playback position |
| `/video/analyze` | POST | Analyze video query with context |
| `/video/conversation/save` | POST | Save video conversation |
| `/video/process-transcript` | POST | Process video transcript |
| `/video/engines` | GET | List active video engines |

## Usage Examples

### Basic Tutoring

```python
import requests

# Submit learning feedback
response = requests.post("http://localhost:8000/feedback", json={
    "student_id": "student_123",
    "content_id": "lesson_001",
    "is_correct": True,
    "confidence": 0.8
})

# Ask adaptive question
response = requests.post("http://localhost:8000/ask", json={
    "student_id": "student_123",
    "video_id": "lesson_001",
    "question": "What are neural networks?",
    "subject_id": "math"
})
```

### Video RAG Integration

```python
# Create demo video data
response = requests.post("http://localhost:8000/video/demo/create", json={
    "video_id": "ml_lecture_001"
})

# Set playback position
response = requests.post("http://localhost:8000/video/playback-position", json={
    "video_id": "ml_lecture_001",
    "position": 45.0
})

# Ask temporal question
response = requests.post("http://localhost:8000/video/analyze", json={
    "video_id": "ml_lecture_001",
    "query": "What was mentioned earlier about training?",
    "top_k": 3
})
```

## Integration with MARE

ARG maintains full compatibility with MARE (Mentorium Automated Reasoning Engine):

- **Shared BKT Algorithms**: Same mathematical foundations
- **Compatible Data Models**: Skill states and evidence events
- **Unified Student Profiles**: Cross-system learning tracking
- **Adaptive Context**: Shared mastery and difficulty bands

## File Structure

```
ARG/
├── tutoring-api/              # Main tutoring system
│   ├── main.py               # FastAPI server with Video RAG integration
│   ├── requirements.txt       # Core dependencies
│   └── README.md            # Tutoring API documentation
├── video_rag_engine.py       # Basic video RAG engine
├── temporal_video_rag_engine.py  # Enhanced temporal engine
├── video_rag_api.py         # Standalone Video RAG API
├── demo_video_rag.py        # Complete demo and examples
├── requirements_rag.txt      # Video RAG dependencies
├── README_RAG_INTEGRATION.md # Detailed Video RAG documentation
└── README_UPDATED.md         # This file
```

## Development

### Running Demos

```bash
# Video RAG demo
python demo_video_rag.py

# Temporal RAG demo
python temporal_video_rag_engine.py
```

### Testing

```bash
# Health check
curl http://localhost:8000/health

# Video RAG availability
curl http://localhost:8000/video/health

# Create demo data
curl -X POST "http://localhost:8000/video/demo/create" \
  -H "Content-Type: application/json" \
  -d '{"video_id": "test_video"}'
```

## Performance

- **Tutoring API**: <100ms response time
- **Video Processing**: ~75 seconds per minute of video
- **Video Queries**: <200ms with temporal context
- **Memory Usage**: ~500MB for full system

## Troubleshooting

### Common Issues

1. **Missing Video RAG Components**
   ```bash
   pip install -r requirements_rag.txt
   ```

2. **LLM Provider Not Configured**
   ```bash
   export LLM_PROVIDER=groq
   export GROQ_API_KEY=your_key
   ```

3. **Port Conflicts**
   ```bash
   export PORT=8001
   python tutoring-api/main.py
   ```

## Roadmap

### Next Features
- [ ] Real video processing with Whisper
- [ ] Visual scene analysis
- [ ] Multi-video temporal reasoning
- [ ] Advanced personalization algorithms
- [ ] Performance optimizations

### Integration Goals
- [ ] Seamless MARE synchronization
- [ ] Unified analytics dashboard
- [ ] Cross-modal learning insights
- [ ] Advanced adaptive recommendations

## License

This project maintains the same license as the original Mentorium components.

---

**Note**: ARG serves as a bridge between traditional tutoring systems and advanced video-based learning, providing a unified platform for adaptive education.
