"""
Enhanced Video RAG Engine with Temporal Awareness - Integrated into ARG
Handles questions about earlier segments and maintains conversation context
"""

import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
import hashlib
from datetime import datetime


@dataclass
class ConversationTurn:
    """Represents a turn in the conversation"""
    timestamp: str
    query: str
    retrieved_chunks: List[str]  # chunk IDs
    response: Optional[str] = None
    user_context: Optional[str] = None  # e.g., "referring to earlier segment"


@dataclass
class VideoChunk:
    """Represents a semantically coherent chunk of video content"""
    chunk_id: str
    start_time: float
    end_time: float
    transcript: str
    summary: str
    embedding: Optional[List[float]] = None
    metadata: Optional[Dict] = None

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, data):
        return cls(**data)


class TemporalVideoRAGEngine:
    """
    Enhanced Video RAG Engine with:
    1. Temporal context awareness (knows what was discussed when)
    2. Conversation history tracking
    3. Smart reference resolution ("earlier", "that part", etc.)
    4. Multi-strategy retrieval (recency + relevance)
    """

    def __init__(self, storage_dir: str = "./video_rag_storage"):
        """
        Initialize Enhanced Video RAG Engine

        Args:
            storage_dir: Directory to store processed video data
        """
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        self.chunks_dir = self.storage_dir / "chunks"
        self.chunks_dir.mkdir(exist_ok=True)

        self.conversations_dir = self.storage_dir / "conversations"
        self.conversations_dir.mkdir(exist_ok=True)

        self.embeddings_model = None
        self.chunks_cache: Dict[str, List[VideoChunk]] = {}

        # Conversation state
        self.conversation_history: List[ConversationTurn] = []
        self.current_playback_position: float = 0.0  # Simulated playback position
        self.recently_viewed_chunks: List[str] = []  # Recently discussed chunk IDs

    def _load_models(self):
        """Lazy load ML models to save memory"""
        if self.embeddings_model is None:
            from sentence_transformers import SentenceTransformer
            print("Loading embedding model...")
            self.embeddings_model = SentenceTransformer('all-MiniLM-L6-v2')

    def _get_video_id(self, video_path: str) -> str:
        """Generate unique ID for video"""
        return hashlib.md5(video_path.encode()).hexdigest()[:12]

    def set_playback_position(self, position: float):
        """
        Update current playback position in video

        Args:
            position: Current position in seconds
        """
        self.current_playback_position = position
        print(f"📍 Current position updated to {position:.1f}s")

    def detect_temporal_reference(self, query: str) -> Dict[str, any]:
        """
        Detect temporal references in query

        Args:
            query: User query

        Returns:
            Dictionary with temporal info
        """
        query_lower = query.lower()
        
        temporal_refs = {
            'earlier': any(word in query_lower for word in ['earlier', 'before', 'previous', 'beginning', 'start']),
            'later': any(word in query_lower for word in ['later', 'after', 'next', 'following', 'end']),
            'current': any(word in query_lower for word in ['now', 'currently', 'this part', 'here']),
            'anaphora': any(word in query_lower for word in ['that', 'it', 'this', 'they', 'those'])
        }
        
        return temporal_refs

    def _load_chunks(self, video_id: str) -> List[VideoChunk]:
        """Load chunks for a video from storage"""
        if video_id in self.chunks_cache:
            return self.chunks_cache[video_id]
        
        chunk_file = self.chunks_dir / f"{video_id}_chunks.json"
        if not chunk_file.exists():
            raise ValueError(f"No chunks found for video {video_id}")
        
        with open(chunk_file, 'r') as f:
            data = json.load(f)
        
        chunks = [VideoChunk.from_dict(chunk_data) for chunk_data in data['chunks']]
        self.chunks_cache[video_id] = chunks
        return chunks

    def _retrieve_by_temporal(self, 
                           chunks: List[VideoChunk], 
                           temporal_ref: str,
                           position: float) -> List[VideoChunk]:
        """
        Retrieve chunks based on temporal reference

        Args:
            chunks: All chunks for the video
            temporal_ref: Type of temporal reference
            position: Current playback position

        Returns:
            List of temporally relevant chunks
        """
        if temporal_ref == 'earlier':
            # Chunks before current position
            return [c for c in chunks if c.end_time < position]
        elif temporal_ref == 'later':
            # Chunks after current position
            return [c for c in chunks if c.start_time > position]
        elif temporal_ref == 'current':
            # Chunks near current position
            return [c for c in chunks if c.start_time <= position <= c.end_time]
        else:
            return []

    def _retrieve_by_anaphora(self, chunks: List[VideoChunk]) -> List[VideoChunk]:
        """
        Retrieve chunks based on anaphoric references (recently discussed)

        Args:
            chunks: All chunks for the video

        Returns:
            List of recently discussed chunks
        """
        if not self.recently_viewed_chunks:
            return []
        
        # Get chunks that were recently discussed
        recently_discussed = [
            c for c in chunks 
            if c.chunk_id in self.recently_viewed_chunks[-5:]  # Last 5 chunks
        ]
        return recently_discussed

    def _semantic_retrieve(self, chunks: List[VideoChunk], query: str, top_k: int = 3) -> List[Tuple[VideoChunk, float]]:
        """
        Retrieve chunks based on semantic similarity

        Args:
            chunks: All chunks for the video
            query: User query
            top_k: Number of chunks to retrieve

        Returns:
            List of (chunk, similarity_score) tuples
        """
        if not chunks:
            return []
        
        self._load_models()
        
        # Generate query embedding
        query_embedding = self.embeddings_model.encode([query])[0]
        
        # Calculate similarities
        similarities = []
        for chunk in chunks:
            if chunk.embedding:
                chunk_embedding = np.array(chunk.embedding)
                similarity = np.dot(chunk_embedding, query_embedding) / (
                    np.linalg.norm(chunk_embedding) * np.linalg.norm(query_embedding)
                )
                similarities.append((chunk, float(similarity)))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def analyze_with_context(self, 
                          query: str, 
                          video_path: str, 
                          top_k: int = 3) -> Dict[str, any]:
        """
        Analyze query with full temporal and conversation context

        Args:
            query: User query
            video_path: Path to video (used as ID)
            top_k: Number of chunks to retrieve

        Returns:
            Dictionary with chunks, prompt, context info
        """
        video_id = self._get_video_id(video_path)
        chunks = self._load_chunks(video_id)
        
        # Detect temporal references
        temporal_refs = self.detect_temporal_reference(query)
        
        # Multi-strategy retrieval
        retrieved_chunks = []
        retrieval_strategy = "semantic"
        
        # Temporal retrieval
        if temporal_refs['earlier']:
            temporal_chunks = self._retrieve_by_temporal(chunks, 'earlier', self.current_playback_position)
            retrieved_chunks.extend([(c, 0.8) for c in temporal_chunks[:2]])  # Boost temporal chunks
            retrieval_strategy = "temporal_earlier"
        
        elif temporal_refs['later']:
            temporal_chunks = self._retrieve_by_temporal(chunks, 'later', self.current_playback_position)
            retrieved_chunks.extend([(c, 0.8) for c in temporal_chunks[:2]])
            retrieval_strategy = "temporal_later"
        
        elif temporal_refs['current']:
            temporal_chunks = self._retrieve_by_temporal(chunks, 'current', self.current_playback_position)
            retrieved_chunks.extend([(c, 0.9) for c in temporal_chunks[:2]])
            retrieval_strategy = "temporal_current"
        
        # Anaphoric retrieval
        if temporal_refs['anaphora']:
            anaphora_chunks = self._retrieve_by_anaphora(chunks)
            retrieved_chunks.extend([(c, 0.7) for c in anaphora_chunks[:1]])
            if retrieval_strategy == "semantic":
                retrieval_strategy = "anaphoric"
        
        # Semantic retrieval (fallback or supplement)
        semantic_results = self._semantic_retrieve(chunks, query, top_k)
        retrieved_chunks.extend(semantic_results)
        
        # Remove duplicates and sort by score
        seen_chunks = set()
        unique_chunks = []
        for chunk, score in retrieved_chunks:
            if chunk.chunk_id not in seen_chunks:
                seen_chunks.add(chunk.chunk_id)
                unique_chunks.append((chunk, score))
        
        unique_chunks.sort(key=lambda x: x[1], reverse=True)
        final_chunks = unique_chunks[:top_k]
        
        # Update conversation history
        self.conversation_history.append(ConversationTurn(
            timestamp=datetime.now().isoformat(),
            query=query,
            retrieved_chunks=[c.chunk_id for c, _ in final_chunks]
        ))
        
        # Update recently viewed chunks
        self.recently_viewed_chunks.extend([c.chunk_id for c, _ in final_chunks])
        
        # Generate context for LLM
        context = self._format_context(final_chunks, temporal_refs)
        
        # Generate prompt
        prompt = self._generate_prompt(query, context, temporal_refs)
        
        return {
            "query": query,
            "num_chunks_retrieved": len(final_chunks),
            "chunks": [c.to_dict() for c, _ in final_chunks],
            "prompt": prompt,
            "context": context,
            "context_info": {
                "retrieval_strategy": retrieval_strategy,
                "temporal_context": temporal_refs,
                "anaphoric_reference": temporal_refs['anaphora'],
                "current_position": self.current_playback_position
            },
            "conversation_turn": len(self.conversation_history)
        }

    def _format_context(self, chunks: List[Tuple[VideoChunk, float]], temporal_refs: Dict) -> str:
        """Format retrieved chunks as context for LLM"""
        context_parts = []
        
        for i, (chunk, score) in enumerate(chunks, 1):
            chunk_text = f"[Chunk {i}] "
            chunk_text += f"[{chunk.start_time:.1f}s - {chunk.end_time:.1f}s] "
            chunk_text += f"(Relevance: {score:.2f})\n"
            chunk_text += f"{chunk.transcript}\n"
            context_parts.append(chunk_text)
        
        return "\n".join(context_parts)

    def _generate_prompt(self, query: str, context: str, temporal_refs: Dict) -> str:
        """Generate prompt for LLM with temporal context"""
        temporal_note = ""
        if temporal_refs['earlier']:
            temporal_note = "The user is asking about content that appeared earlier in the video."
        elif temporal_refs['later']:
            temporal_note = "The user is asking about content that appears later in the video."
        elif temporal_refs['current']:
            temporal_note = "The user is asking about content at the current position."
        elif temporal_refs['anaphora']:
            temporal_note = "The user is referring to something mentioned recently."
        
        prompt = f"""You are analyzing a video transcript to answer the user's question.

{temporal_note}

User Question: {query}

Relevant Video Segments:
{context}

Please answer the user's question based on the provided video segments. If the segments don't contain enough information, say so clearly. Reference the timestamps when relevant."""

        return prompt

    def save_conversation(self, video_path: str, session_name: Optional[str] = None):
        """
        Save conversation history for a video

        Args:
            video_path: Path to video
            session_name: Optional name for the session
        """
        video_id = self._get_video_id(video_path)
        
        if session_name is None:
            session_name = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        conversation_file = self.conversations_dir / f"{video_id}_{session_name}.json"
        
        conversation_data = {
            "video_id": video_id,
            "session_name": session_name,
            "created_at": datetime.now().isoformat(),
            "conversation_history": [asdict(turn) for turn in self.conversation_history],
            "final_playback_position": self.current_playback_position
        }
        
        with open(conversation_file, 'w') as f:
            json.dump(conversation_data, f, indent=2)
        
        print(f"💾 Conversation saved to {conversation_file}")

    def create_demo_chunks(self, video_id: str):
        """Create demo chunks for testing (no real video needed)"""
        demo_chunks = [
            VideoChunk(
                chunk_id="chunk_001",
                start_time=0.0,
                end_time=30.0,
                transcript="Welcome to machine learning fundamentals. Today we'll explore neural networks and how they learn from data.",
                summary="Introduction to neural networks",
                embedding=None,
                metadata={"topic": "introduction"}
            ),
            VideoChunk(
                chunk_id="chunk_002", 
                start_time=30.0,
                end_time=60.0,
                transcript="Neural networks consist of layers of interconnected nodes. Each connection has a weight that adjusts during training.",
                summary="Neural network structure",
                embedding=None,
                metadata={"topic": "architecture"}
            ),
            VideoChunk(
                chunk_id="chunk_003",
                start_time=60.0,
                end_time=90.0,
                transcript="Training involves backpropagation, where we adjust weights based on the error between predicted and actual outputs.",
                summary="Training process",
                embedding=None,
                metadata={"topic": "training"}
            ),
            VideoChunk(
                chunk_id="chunk_004",
                start_time=90.0,
                end_time=120.0,
                transcript="Applications include image recognition, natural language processing, and autonomous vehicles.",
                summary="Real-world applications",
                embedding=None,
                metadata={"topic": "applications"}
            )
        ]
        
        # Generate embeddings for demo chunks
        self._load_models()
        for chunk in demo_chunks:
            chunk.embedding = self.embeddings_model.encode([chunk.transcript])[0].tolist()
        
        # Save chunks
        chunk_file = self.chunks_dir / f"{video_id}_chunks.json"
        chunk_data = {
            "chunks": [chunk.to_dict() for chunk in demo_chunks],
            "metadata": {
                "video_id": video_id,
                "created_at": datetime.now().isoformat(),
                "total_chunks": len(demo_chunks)
            }
        }
        
        with open(chunk_file, 'w') as f:
            json.dump(chunk_data, f, indent=2)
        
        print(f"🎬 Created {len(demo_chunks)} demo chunks for {video_id}")
        return demo_chunks


def demo():
    """Demo the temporal video RAG engine"""
    print("🎥 Temporal Video RAG Engine Demo")
    print("=" * 50)
    
    # Initialize engine
    engine = TemporalVideoRAGEngine()
    
    # Create demo data
    video_id = "demo_ml_lecture"
    engine.create_demo_chunks(video_id)
    
    # Test different types of queries
    test_queries = [
        ("What are neural networks?", "semantic"),
        ("What was mentioned earlier about training?", "temporal_earlier"),
        ("What applications did they discuss?", "semantic"),
        ("What was said at the beginning?", "temporal_earlier"),
        ("Tell me more about that", "anaphoric")
    ]
    
    for query, query_type in test_queries:
        print(f"\n🔍 Query: '{query}' (Type: {query_type})")
        
        # Set a playback position for temporal queries
        if query_type.startswith("temporal"):
            engine.set_playback_position(45.0)  # Middle of video
        
        # Analyze with context
        result = engine.analyze_with_context(query, video_id, top_k=2)
        
        print(f"  Strategy: {result['context_info']['retrieval_strategy']}")
        print(f"  Chunks retrieved: {result['num_chunks_retrieved']}")
        print(f"  Context preview: {result['context'][:200]}...")
    
    # Save conversation
    engine.save_conversation(video_id, "demo_session")
    
    print("\n✅ Demo completed!")


if __name__ == "__main__":
    demo()
