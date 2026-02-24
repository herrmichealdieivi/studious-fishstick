# Temporal Video RAG – Integration

Enhanced Video RAG with **temporal awareness** and **conversation context**: answers questions about “earlier”, “that part”, “what’s next”, and keeps context across turns.

## What’s included

| Item | Description |
|------|-------------|
| `temporal_video_rag_engine.py` | Engine: temporal refs, anaphora, playback position, conversation history |
| `api.py` | FastAPI backend used by the app |
| `mentorium-app/services/videoRag.js` | App client: `setPlaybackPosition`, `analyzeWithContext`, `saveConversation` |

## Backend (Python)

### Install and run API

```bash
cd RAG
pip install -r requirements.txt
# Optional: set where chunk/conversation files are stored
set VIDEO_RAG_STORAGE_DIR=./video_rag_storage
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

- **Health:** `GET http://localhost:8000/health`
- **Set position:** `POST /playback-position` body `{ "video_id": "lesson_1", "position": 45.2 }`
- **Ask question:** `POST /analyze` body `{ "video_id": "lesson_1", "query": "What was said earlier about X?", "top_k": 3 }`
- **Save conversation:** `POST /conversation/save` body `{ "video_id": "lesson_1", "session_name": "optional" }`

### Chunk data for a video

The engine expects per-video chunk JSON under `VIDEO_RAG_STORAGE_DIR/chunks/`:

- File name: `{hash(video_id)}_chunks.json`
- Each chunk: `chunk_id`, `start_time`, `end_time`, `transcript`, `summary`, `embedding` (list of floats), optional `metadata`

Generate chunks with the demo in `temporal_video_rag_engine.py` (mock) or by processing real videos (e.g. using `video_rag_engine.py` and exporting this format).

```bash
# Demo with mock data (no video file)
python temporal_video_rag_engine.py
```

## App (Expo)

### Env

In `mentorium-app/.env`:

```env
EXPO_PUBLIC_VIDEO_RAG_API_URL=http://localhost:8000
```

For a device/emulator, use your machine’s IP (e.g. `http://192.168.1.10:8000`) instead of `localhost`.

### Use in the app

```js
import {
  setPlaybackPosition,
  analyzeWithContext,
  saveConversation,
  videoRagHealth,
} from '../services/videoRag';

// When playback time changes (e.g. every 5–10 seconds)
await setPlaybackPosition('lesson_42', currentTimeSeconds);

// When user asks a question (temporal + conversation aware)
const result = await analyzeWithContext('lesson_42', userQuestion, 3);
// result.chunks, result.prompt, result.context_info

// Optional: send result.prompt to your LLM (OpenAI/Anthropic) and show the answer

// Optional: save conversation when leaving the video
await saveConversation('lesson_42', 'session_1');
```

- **video_id** in the app can be any stable id (e.g. lesson id, `"lecture_1"`). The backend uses it as the video key; chunk files must be prepared for that id (see above).

## Features

- **Temporal references:** “earlier”, “before”, “later”, “next”, “at the beginning” → retrieves chunks by position.
- **Anaphora:** “that”, “it”, “what you said” → boosts recently discussed chunks.
- **Playback position:** Chunks near current time can get a small recency boost.
- **Conversation history:** Tracks recent chunks per video so follow-up questions stay in context.

## Summary

1. Run the API: `uvicorn api:app --host 0.0.0.0 --port 8000` from `RAG/`.
2. Set `EXPO_PUBLIC_VIDEO_RAG_API_URL` in the app.
3. Ensure chunk JSON exists for each `video_id` you use.
4. In the app: call `setPlaybackPosition` as the video plays, and `analyzeWithContext` when the user asks a question; optionally send the returned `prompt` to your LLM and use `saveConversation` when leaving.
