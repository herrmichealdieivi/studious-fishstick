"""
Enhanced Video RAG Engine with Temporal Awareness
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
        Initialize the Enhanced Video RAG Engine

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
        Detect if query refers to a specific time period

        Args:
            query: User query

        Returns:
            Dictionary with temporal context
        """
        query_lower = query.lower()

        temporal_indicators = {
            'earlier': -1,
            'before': -1,
            'previously': -1,
            'back': -1,
            'ago': -1,
            'at the beginning': -2,
            'at the start': -2,
            'later': 1,
            'after': 1,
            'upcoming': 1,
            'next': 1,
            'current': 0,
            'now': 0,
            'this part': 0,
            'just mentioned': 0,
            'just said': 0,
        }

        detected_reference = None
        direction = 0

        for indicator, dir_value in temporal_indicators.items():
            if indicator in query_lower:
                detected_reference = indicator
                direction = dir_value
                break

        return {
            'has_temporal_reference': detected_reference is not None,
            'reference_type': detected_reference,
            'direction': direction,  # -2=start, -1=before, 0=current, 1=after
        }

    def detect_anaphoric_reference(self, query: str) -> bool:
        """
        Detect if query refers to previous conversation
        (e.g., "that", "it", "what you said")

        Args:
            query: User query

        Returns:
            True if query likely refers to previous context
        """
        query_lower = query.lower()

        anaphoric_indicators = [
            'that', 'it', 'those', 'these', 'this',
            'what you said', 'what you mentioned', 'you said',
            'the example', 'the point', 'that part', 'that section',
            'explain more', 'elaborate', 'tell me more',
            'why', 'how does', 'what about'
        ]

        # Check if query starts with anaphoric reference
        for indicator in anaphoric_indicators:
            if query_lower.startswith(indicator) or f" {indicator} " in f" {query_lower} ":
                return True

        return False

    def get_temporal_context_chunks(
        self,
        video_path: str,
        temporal_context: Dict,
        num_chunks: int = 3
    ) -> List[VideoChunk]:
        """
        Get chunks based on temporal context

        Args:
            video_path: Path to video
            temporal_context: Temporal reference info
            num_chunks: Number of chunks to retrieve

        Returns:
            List of chunks based on temporal position
        """
        video_id = self._get_video_id(video_path)

        if video_id not in self.chunks_cache:
            chunks_file = self.chunks_dir / f"{video_id}_chunks.json"
            if not chunks_file.exists():
                raise ValueError(f"Video not processed: {video_path}")
            self.chunks_cache[video_id] = self._load_chunks(chunks_file)

        chunks = self.chunks_cache[video_id]
        current_pos = self.current_playback_position
        direction = temporal_context['direction']

        if direction == -2:  # Beginning
            return chunks[:num_chunks]
        elif direction == -1:  # Earlier/before
            # Get chunks before current position
            earlier_chunks = [c for c in chunks if c.end_time < current_pos]
            return earlier_chunks[-num_chunks:] if earlier_chunks else chunks[:num_chunks]
        elif direction == 0:  # Current
            # Get chunks around current position
            current_chunks = [c for c in chunks
                            if c.start_time <= current_pos <= c.end_time]
            if current_chunks:
                idx = chunks.index(current_chunks[0])
                start_idx = max(0, idx - 1)
                end_idx = min(len(chunks), idx + 2)
                return chunks[start_idx:end_idx]
            return chunks[:num_chunks]
        else:  # Later/after
            # Get chunks after current position
            later_chunks = [c for c in chunks if c.start_time > current_pos]
            return later_chunks[:num_chunks] if later_chunks else chunks[-num_chunks:]

    def retrieve_with_conversation_context(
        self,
        query: str,
        video_path: str,
        top_k: int = 3,
        use_temporal_context: bool = True,
        use_conversation_history: bool = True
    ) -> Tuple[List[Tuple[VideoChunk, float]], Dict]:
        """
        Enhanced retrieval with temporal and conversational awareness

        Args:
            query: User query
            video_path: Path to video
            top_k: Number of chunks to retrieve
            use_temporal_context: Consider playback position
            use_conversation_history: Consider previous queries

        Returns:
            Tuple of (chunks with scores, context info)
        """
        self._load_models()

        video_id = self._get_video_id(video_path)

        # Load chunks
        if video_id not in self.chunks_cache:
            chunks_file = self.chunks_dir / f"{video_id}_chunks.json"
            if not chunks_file.exists():
                raise ValueError(f"Video not processed: {video_path}")
            self.chunks_cache[video_id] = self._load_chunks(chunks_file)

        all_chunks = self.chunks_cache[video_id]

        # Detect temporal references
        temporal_context = self.detect_temporal_reference(query)
        has_anaphoric_ref = self.detect_anaphoric_reference(query)

        context_info = {
            'temporal_context': temporal_context,
            'anaphoric_reference': has_anaphoric_ref,
            'current_position': self.current_playback_position,
            'retrieval_strategy': []
        }

        # Strategy 1: Handle explicit temporal references
        if use_temporal_context and temporal_context['has_temporal_reference']:
            print(f"🔍 Detected temporal reference: '{temporal_context['reference_type']}'")
            context_info['retrieval_strategy'].append('temporal_reference')

            temporal_chunks = self.get_temporal_context_chunks(
                video_path,
                temporal_context,
                num_chunks=top_k
            )

            # Still calculate relevance scores for ranking
            query_embedding = self.embeddings_model.encode(query)
            chunks_with_scores = []

            for chunk in temporal_chunks:
                if chunk.embedding is None:
                    continue
                chunk_embedding = np.array(chunk.embedding)
                similarity = np.dot(query_embedding, chunk_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
                )
                chunks_with_scores.append((chunk, float(similarity)))

            chunks_with_scores.sort(key=lambda x: x[1], reverse=True)
            return chunks_with_scores[:top_k], context_info

        # Strategy 2: Handle anaphoric references (refers to previous conversation)
        if use_conversation_history and has_anaphoric_ref and self.recently_viewed_chunks:
            print(f"🔍 Detected reference to previous conversation")
            context_info['retrieval_strategy'].append('anaphoric_reference')

            # Get recently discussed chunks
            recent_chunk_ids = set(self.recently_viewed_chunks[-5:])
            recent_chunks = [c for c in all_chunks if c.chunk_id in recent_chunk_ids]

            # Also do semantic search to find related content
            query_embedding = self.embeddings_model.encode(query)
            all_chunks_with_scores = []

            for chunk in all_chunks:
                if chunk.embedding is None:
                    continue
                chunk_embedding = np.array(chunk.embedding)
                similarity = np.dot(query_embedding, chunk_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
                )

                # Boost score if chunk was recently viewed
                boost = 1.3 if chunk.chunk_id in recent_chunk_ids else 1.0
                all_chunks_with_scores.append((chunk, float(similarity) * boost))

            all_chunks_with_scores.sort(key=lambda x: x[1], reverse=True)
            return all_chunks_with_scores[:top_k], context_info

        # Strategy 3: Standard semantic search with recency bias
        context_info['retrieval_strategy'].append('semantic_with_recency')

        query_embedding = self.embeddings_model.encode(query)
        chunks_with_scores = []

        for chunk in all_chunks:
            if chunk.embedding is None:
                continue
            chunk_embedding = np.array(chunk.embedding)
            similarity = np.dot(query_embedding, chunk_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
            )

            # Small recency boost for chunks near current position
            if use_temporal_context:
                time_distance = abs(chunk.start_time - self.current_playback_position)
                recency_boost = 1.0 + (0.1 if time_distance < 30 else 0.0)
            else:
                recency_boost = 1.0

            chunks_with_scores.append((chunk, float(similarity) * recency_boost))

        chunks_with_scores.sort(key=lambda x: x[1], reverse=True)
        return chunks_with_scores[:top_k], context_info

    def analyze_with_context(
        self,
        query: str,
        video_path: str,
        top_k: int = 3,
        llm_prompt_template: Optional[str] = None
    ) -> Dict:
        """
        Analyze query with full context awareness

        Args:
            query: User query
            video_path: Path to video
            top_k: Number of chunks to retrieve
            llm_prompt_template: Optional custom prompt template

        Returns:
            Dictionary with enhanced context and prompt
        """
        # Retrieve with context
        relevant_chunks, context_info = self.retrieve_with_conversation_context(
            query, video_path, top_k
        )

        # Update conversation history
        chunk_ids = [chunk.chunk_id for chunk, _ in relevant_chunks]
        self.recently_viewed_chunks.extend(chunk_ids)

        # Keep only recent history
        if len(self.recently_viewed_chunks) > 20:
            self.recently_viewed_chunks = self.recently_viewed_chunks[-20:]

        # Format context
        context_parts = []
        for i, (chunk, score) in enumerate(relevant_chunks, 1):
            context_parts.append(
                f"[Section {i}] (Time: {chunk.start_time:.1f}s - {chunk.end_time:.1f}s, "
                f"Relevance: {score:.2%})\n{chunk.transcript}\n"
            )

        context = "\n".join(context_parts)

        # Create enhanced prompt
        temporal_note = ""
        if context_info['temporal_context']['has_temporal_reference']:
            ref_type = context_info['temporal_context']['reference_type']
            temporal_note = f"\n(Note: User is asking about content {ref_type} in the video)"

        conversation_note = ""
        if context_info['anaphoric_reference']:
            conversation_note = "\n(Note: User is referring to previously discussed content)"

        if llm_prompt_template is None:
            llm_prompt_template = """Based on the following video sections, please answer the query.{temporal_note}{conversation_note}

Query: {query}

Current playback position: {current_position:.1f}s

Relevant Video Sections:
{context}

Answer:"""

        prompt = llm_prompt_template.format(
            query=query,
            context=context,
            temporal_note=temporal_note,
            conversation_note=conversation_note,
            current_position=self.current_playback_position
        )

        # Save conversation turn
        turn = ConversationTurn(
            timestamp=datetime.now().isoformat(),
            query=query,
            retrieved_chunks=chunk_ids,
            user_context=str(context_info)
        )
        self.conversation_history.append(turn)

        return {
            'query': query,
            'num_chunks_retrieved': len(relevant_chunks),
            'chunks': [
                {
                    'chunk_id': chunk.chunk_id,
                    'start_time': chunk.start_time,
                    'end_time': chunk.end_time,
                    'transcript': chunk.transcript,
                    'similarity_score': score
                }
                for chunk, score in relevant_chunks
            ],
            'prompt': prompt,
            'context': context,
            'context_info': context_info,
            'conversation_turn': len(self.conversation_history)
        }

    def save_conversation(self, video_path: str, session_name: Optional[str] = None):
        """Save conversation history"""
        if session_name is None:
            session_name = datetime.now().strftime("%Y%m%d_%H%M%S")

        video_id = self._get_video_id(video_path)
        conv_file = self.conversations_dir / f"{video_id}_{session_name}.json"

        data = {
            'video_path': video_path,
            'conversation_history': [asdict(turn) for turn in self.conversation_history],
            'final_position': self.current_playback_position
        }

        with open(conv_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"💾 Conversation saved to {conv_file}")

    def _load_chunks(self, filepath: Path) -> List[VideoChunk]:
        """Load chunks from JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        return [VideoChunk.from_dict(chunk_data) for chunk_data in data]


def demo_temporal_awareness():
    """Demonstrate temporal and contextual awareness"""

    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║            TEMPORAL VIDEO RAG - Context-Aware Demonstration                ║
╚════════════════════════════════════════════════════════════════════════════╝
""")

    # Create mock data
    from sentence_transformers import SentenceTransformer

    print("Setting up demo with mock video content...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Mock video chunks
    mock_data = [
        (0, 60, "Introduction to neural networks and their basic structure."),
        (60, 120, "Explanation of backpropagation algorithm in detail."),
        (120, 180, "Convolutional neural networks for image processing."),
        (180, 240, "Recurrent networks and their applications in NLP."),
        (240, 300, "Conclusion and summary of key concepts."),
    ]

    chunks = []
    for i, (start, end, text) in enumerate(mock_data):
        embedding = model.encode(text).tolist()
        chunk = VideoChunk(
            chunk_id=f"chunk_{i:04d}",
            start_time=float(start),
            end_time=float(end),
            transcript=text,
            summary=text[:50] + "...",
            embedding=embedding,
            metadata={}
        )
        chunks.append(chunk)

    # Save mock chunks
    engine = TemporalVideoRAGEngine("./demo_temporal_storage")
    video_path = "demo_lecture.mp4"
    video_id = engine._get_video_id(video_path)
    chunks_file = engine.chunks_dir / f"{video_id}_chunks.json"

    with open(chunks_file, 'w') as f:
        json.dump([c.to_dict() for c in chunks], f, indent=2)

    engine.chunks_cache[video_id] = chunks

    print("\n✓ Mock video processed (5 chunks, 300 seconds total)")

    # Simulation scenarios
    scenarios = [
        {
            'position': 200,
            'queries': [
                "What was explained earlier about backpropagation?",
                "Can you tell me more about that?",
                "What's coming up next?",
            ]
        },
        {
            'position': 50,
            'queries': [
                "What is covered later in the video?",
                "Tell me about what's at the beginning",
            ]
        }
    ]

    for scenario_num, scenario in enumerate(scenarios, 1):
        print(f"\n{'='*80}")
        print(f"SCENARIO {scenario_num}: User at position {scenario['position']}s")
        print('='*80)

        engine.set_playback_position(scenario['position'])

        for query in scenario['queries']:
            print(f"\n📝 User Query: \"{query}\"")
            print("-" * 80)

            result = engine.analyze_with_context(query, video_path, top_k=2)

            print(f"\n🎯 Retrieval Strategy: {result['context_info']['retrieval_strategy']}")

            if result['context_info']['temporal_context']['has_temporal_reference']:
                print(f"   Temporal reference detected: '{result['context_info']['temporal_context']['reference_type']}'")

            if result['context_info']['anaphoric_reference']:
                print(f"   Anaphoric reference detected (referring to previous context)")

            print(f"\n📍 Retrieved Chunks:")
            for chunk_data in result['chunks']:
                print(f"   • [{chunk_data['start_time']:.0f}s-{chunk_data['end_time']:.0f}s] "
                      f"(Relevance: {chunk_data['similarity_score']:.1%})")
                print(f"     {chunk_data['transcript']}")

            print()

    # Save conversation
    engine.save_conversation(video_path, "demo_session")

    print("\n" + "="*80)
    print("DEMONSTRATION COMPLETE")
    print("="*80)
    print("""
Key Features Demonstrated:
✓ Temporal reference detection ("earlier", "later", "next", etc.)
✓ Anaphoric reference handling ("that", "it", "what you said")
✓ Playback position awareness
✓ Conversation history tracking
✓ Context-aware retrieval strategies
✓ Boost for recently discussed content

This enables natural conversations about video content regardless of when
the user asks the question!
""")


if __name__ == "__main__":
    demo_temporal_awareness()
