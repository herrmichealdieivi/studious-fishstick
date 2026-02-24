# Video RAG Engine Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VIDEO RAG ENGINE                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Video     │─────▶│   Audio      │─────▶│ Transcript  │
│   Input     │      │ Extraction   │      │   (Whisper) │
│  (.mp4)     │      │  (FFmpeg)    │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │  Semantic   │
                                          │  Chunking   │
                                          │             │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │  Embedding  │
                                          │ Generation  │
                                          │(Sentence-T) │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │   Storage   │
                                          │   (JSON +   │
                                          │   Vectors)  │
                                          └─────────────┘
                                                   │
        ┌──────────────────────────────────────────┘
        │
        ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│    Query    │─────▶│   Vector     │─────▶│   Top-K     │
│   Input     │      │  Similarity  │      │   Chunks    │
│             │      │   Search     │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │   Prompt    │
                                          │ Formatting  │
                                          │             │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │     LLM     │
                                          │  (Claude/   │
                                          │   GPT/etc)  │
                                          └─────────────┘
```

## Component Details

### 1. Audio Extraction
- **Tool**: FFmpeg
- **Input**: Video file (MP4, AVI, MOV, etc.)
- **Output**: WAV audio file (16kHz, mono)

### 2. Transcription
- **Model**: OpenAI Whisper
- **Sizes**: tiny, base, small, medium, large
- **Output**: Transcript segments with timestamps

### 3. Semantic Chunking
- **Method**: Content similarity + duration limits
- **Algorithm**:
  1. Compare embedding similarity between segments
  2. Split if similarity < threshold OR duration > max
  3. Create coherent topical chunks

### 4. Embedding Generation
- **Model**: Sentence-Transformers (all-MiniLM-L6-v2)
- **Dimension**: 384
- **Purpose**: Enable semantic similarity search

### 5. Vector Similarity Search
- **Method**: Cosine similarity
- **Formula**: similarity = (A · B) / (||A|| × ||B||)
- **Process**: Find top-K most relevant chunks

### 6. LLM Analysis
- **Supported**: Claude, GPT, local models
- **Input**: Formatted prompt with context
- **Output**: Natural language answer with sources

## Key Design Decisions

### Why Semantic Chunking?
- Each chunk is topically coherent
- No mid-topic splits
- Better retrieval quality

### Why Caching?
- Process once, query unlimited times
- Queries are <100ms after initial processing

### Why Vector Embeddings?
- Semantic meaning > keyword matching
- Finds relevant content even with different wording

## Performance

- **Processing**: ~75 seconds per minute of video
- **Querying**: <100ms per query
- **Storage**: ~2 KB per second of video
