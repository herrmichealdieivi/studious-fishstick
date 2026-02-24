"""
Video RAG Engine
A comprehensive system for chunking videos into semantic sections and retrieving relevant content for LLM analysis.
"""

import os
import json
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import timedelta
import hashlib


@dataclass
class VideoChunk:
    """Represents a semantic chunk of video content"""
    chunk_id: str
    start_time: float  # seconds
    end_time: float  # seconds
    transcript: str
    visual_description: str
    scene_summary: str
    keywords: List[str]
    embedding: Optional[np.ndarray] = None
    
    def to_dict(self):
        """Convert to dictionary for storage"""
        data = asdict(self)
        if self.embedding is not None:
            data['embedding'] = self.embedding.tolist()
        return data
    
    @classmethod
    def from_dict(cls, data: dict):
        """Create from dictionary"""
        if 'embedding' in data and data['embedding'] is not None:
            data['embedding'] = np.array(data['embedding'])
        return cls(**data)
    
    def get_duration(self) -> float:
        """Get chunk duration in seconds"""
        return self.end_time - self.start_time
    
    def format_timestamp(self, seconds: float) -> str:
        """Format seconds to HH:MM:SS"""
        return str(timedelta(seconds=int(seconds)))


class VideoChunker:
    """Handles intelligent chunking of video content"""
    
    def __init__(self, 
                 max_chunk_duration: float = 60.0,  # seconds
                 min_chunk_duration: float = 10.0,
                 overlap_duration: float = 2.0):
        self.max_chunk_duration = max_chunk_duration
        self.min_chunk_duration = min_chunk_duration
        self.overlap_duration = overlap_duration
    
    def chunk_by_transcript(self, 
                           transcript_segments: List[Dict],
                           visual_data: Optional[List[Dict]] = None) -> List[VideoChunk]:
        """
        Chunk video based on transcript with semantic boundaries.
        
        Args:
            transcript_segments: List of dicts with 'start', 'end', 'text'
            visual_data: Optional visual scene data
        
        Returns:
            List of VideoChunk objects
        """
        chunks = []
        current_chunk_segments = []
        current_start = None
        chunk_index = 0
        
        for segment in transcript_segments:
            if current_start is None:
                current_start = segment['start']
            
            current_chunk_segments.append(segment)
            current_duration = segment['end'] - current_start
            
            # Check if we should create a chunk
            should_chunk = (
                current_duration >= self.max_chunk_duration or
                self._is_semantic_boundary(segment, current_chunk_segments)
            )
            
            if should_chunk and current_duration >= self.min_chunk_duration:
                chunk = self._create_chunk(
                    chunk_index,
                    current_start,
                    segment['end'],
                    current_chunk_segments,
                    visual_data
                )
                chunks.append(chunk)
                
                # Prepare for next chunk with overlap
                overlap_start = segment['end'] - self.overlap_duration
                current_chunk_segments = [
                    s for s in current_chunk_segments 
                    if s['end'] > overlap_start
                ]
                current_start = overlap_start if current_chunk_segments else None
                chunk_index += 1
        
        # Handle remaining segments
        if current_chunk_segments and current_start is not None:
            last_segment = current_chunk_segments[-1]
            chunk = self._create_chunk(
                chunk_index,
                current_start,
                last_segment['end'],
                current_chunk_segments,
                visual_data
            )
            chunks.append(chunk)
        
        return chunks
    
    def _is_semantic_boundary(self, segment: Dict, chunk_segments: List[Dict]) -> bool:
        """Detect semantic boundaries in transcript"""
        text = segment['text'].strip()
        
        # Sentence endings
        if text.endswith(('.', '!', '?')):
            return True
        
        # Topic transition indicators
        transition_phrases = [
            'moving on', 'next', 'now let\'s', 'another', 'finally',
            'in conclusion', 'to summarize', 'first', 'second', 'third'
        ]
        text_lower = text.lower()
        if any(phrase in text_lower for phrase in transition_phrases):
            return True
        
        # Long pause indicator (would need actual timing data)
        if len(chunk_segments) > 0:
            prev_end = chunk_segments[-1]['end']
            if segment['start'] - prev_end > 2.0:  # 2 second pause
                return True
        
        return False
    
    def _create_chunk(self,
                     chunk_id: int,
                     start: float,
                     end: float,
                     segments: List[Dict],
                     visual_data: Optional[List[Dict]]) -> VideoChunk:
        """Create a VideoChunk from segments"""
        # Combine transcript
        transcript = ' '.join(s['text'] for s in segments)
        
        # Extract keywords (simple implementation)
        keywords = self._extract_keywords(transcript)
        
        # Get visual description for this time range
        visual_desc = self._get_visual_description(start, end, visual_data)
        
        # Generate scene summary
        scene_summary = self._generate_summary(transcript, visual_desc)
        
        chunk_hash = hashlib.md5(f"{chunk_id}_{start}_{end}".encode()).hexdigest()[:8]
        
        return VideoChunk(
            chunk_id=f"chunk_{chunk_id}_{chunk_hash}",
            start_time=start,
            end_time=end,
            transcript=transcript,
            visual_description=visual_desc,
            scene_summary=scene_summary,
            keywords=keywords,
            embedding=None  # Will be set by embedder
        )
    
    def _extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """Simple keyword extraction"""
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
                     'to', 'for', 'of', 'with', 'is', 'was', 'are', 'were',
                     'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they'}
        
        words = text.lower().split()
        words = [w.strip('.,!?;:') for w in words]
        words = [w for w in words if w and w not in stop_words and len(w) > 3]
        
        # Count frequency
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, _ in sorted_words[:top_n]]
    
    def _get_visual_description(self, 
                               start: float, 
                               end: float, 
                               visual_data: Optional[List[Dict]]) -> str:
        """Get visual description for time range"""
        if not visual_data:
            return "No visual data available"
        
        relevant_scenes = [
            scene for scene in visual_data
            if scene['start'] <= end and scene['end'] >= start
        ]
        
        if not relevant_scenes:
            return "No visual data for this segment"
        
        descriptions = [scene.get('description', '') for scene in relevant_scenes]
        return '; '.join(filter(None, descriptions))
    
    def _generate_summary(self, transcript: str, visual_desc: str) -> str:
        """Generate a simple summary"""
        # For a real implementation, you'd use an LLM here
        # This is a placeholder
        words = transcript.split()
        if len(words) > 50:
            summary = ' '.join(words[:50]) + '...'
        else:
            summary = transcript
        
        if visual_desc and visual_desc != "No visual data available":
            summary += f" [Visual: {visual_desc[:100]}]"
        
        return summary


class EmbeddingGenerator:
    """Generate embeddings for video chunks"""
    
    def __init__(self, embedding_dim: int = 384):
        self.embedding_dim = embedding_dim
    
    def generate_embedding(self, chunk: VideoChunk) -> np.ndarray:
        """
        Generate embedding for a chunk.
        In production, this would use a real embedding model like sentence-transformers.
        This is a mock implementation using TF-IDF-like hashing.
        """
        # Combine all textual content
        combined_text = f"{chunk.transcript} {chunk.scene_summary} {' '.join(chunk.keywords)}"
        
        # Simple hash-based embedding (replace with real model)
        embedding = self._text_to_embedding(combined_text)
        
        return embedding
    
    def _text_to_embedding(self, text: str) -> np.ndarray:
        """Convert text to embedding vector (mock implementation)"""
        # In production, use: sentence-transformers, OpenAI, Cohere, etc.
        # This creates a deterministic embedding based on text content
        
        words = text.lower().split()
        embedding = np.zeros(self.embedding_dim)
        
        for i, word in enumerate(words):
            # Hash each word to multiple dimensions
            hash_val = int(hashlib.md5(word.encode()).hexdigest(), 16)
            for j in range(5):  # Each word affects 5 dimensions
                dim = (hash_val + j * 997) % self.embedding_dim
                embedding[dim] += 1.0 / (i + 1)  # Position weighting
        
        # Normalize
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        
        return embedding
    
    def batch_generate(self, chunks: List[VideoChunk]) -> List[VideoChunk]:
        """Generate embeddings for multiple chunks"""
        for chunk in chunks:
            chunk.embedding = self.generate_embedding(chunk)
        return chunks


class VideoRAGRetriever:
    """Retrieves relevant video chunks based on queries"""
    
    def __init__(self, chunks: List[VideoChunk], embedder: EmbeddingGenerator):
        self.chunks = chunks
        self.embedder = embedder
        self._build_index()
    
    def _build_index(self):
        """Build embedding index"""
        self.embeddings = np.array([chunk.embedding for chunk in self.chunks])
    
    def retrieve(self, 
                query: str, 
                top_k: int = 3,
                score_threshold: float = 0.0) -> List[Tuple[VideoChunk, float]]:
        """
        Retrieve most relevant chunks for a query.
        
        Args:
            query: Search query
            top_k: Number of results to return
            score_threshold: Minimum similarity score
        
        Returns:
            List of (chunk, score) tuples
        """
        # Generate query embedding
        query_embedding = self.embedder._text_to_embedding(query)
        
        # Compute similarities
        similarities = self._compute_similarities(query_embedding)
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Filter by threshold and return
        results = []
        for idx in top_indices:
            score = similarities[idx]
            if score >= score_threshold:
                results.append((self.chunks[idx], float(score)))
        
        return results
    
    def _compute_similarities(self, query_embedding: np.ndarray) -> np.ndarray:
        """Compute cosine similarities"""
        # Cosine similarity
        similarities = np.dot(self.embeddings, query_embedding)
        return similarities
    
    def retrieve_by_keywords(self, keywords: List[str], top_k: int = 3) -> List[VideoChunk]:
        """Retrieve chunks by keyword matching"""
        keyword_set = set(k.lower() for k in keywords)
        
        scored_chunks = []
        for chunk in self.chunks:
            chunk_keywords = set(k.lower() for k in chunk.keywords)
            overlap = len(keyword_set & chunk_keywords)
            if overlap > 0:
                scored_chunks.append((chunk, overlap))
        
        # Sort by overlap count
        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        
        return [chunk for chunk, _ in scored_chunks[:top_k]]
    
    def retrieve_by_timerange(self, start: float, end: float) -> List[VideoChunk]:
        """Retrieve chunks within a time range"""
        return [
            chunk for chunk in self.chunks
            if chunk.start_time <= end and chunk.end_time >= start
        ]


class VideoRAGEngine:
    """Main RAG engine orchestrating all components"""
    
    def __init__(self, 
                 max_chunk_duration: float = 60.0,
                 min_chunk_duration: float = 10.0,
                 overlap_duration: float = 2.0,
                 embedding_dim: int = 384):
        self.chunker = VideoChunker(
            max_chunk_duration=max_chunk_duration,
            min_chunk_duration=min_chunk_duration,
            overlap_duration=overlap_duration
        )
        self.embedder = EmbeddingGenerator(embedding_dim=embedding_dim)
        self.retriever: Optional[VideoRAGRetriever] = None
        self.chunks: List[VideoChunk] = []
        self.video_metadata = {}
    
    def process_video(self,
                     video_id: str,
                     transcript_segments: List[Dict],
                     visual_data: Optional[List[Dict]] = None,
                     metadata: Optional[Dict] = None):
        """
        Process a video and prepare it for retrieval.
        
        Args:
            video_id: Unique identifier for the video
            transcript_segments: List of transcript segments
            visual_data: Optional visual scene descriptions
            metadata: Optional video metadata
        """
        print(f"Processing video: {video_id}")
        
        # Store metadata
        self.video_metadata[video_id] = metadata or {}
        
        # Chunk the video
        print("Chunking video...")
        chunks = self.chunker.chunk_by_transcript(transcript_segments, visual_data)
        print(f"Created {len(chunks)} chunks")
        
        # Generate embeddings
        print("Generating embeddings...")
        chunks = self.embedder.batch_generate(chunks)
        
        # Store chunks
        self.chunks.extend(chunks)
        
        # Build retriever
        print("Building retrieval index...")
        self.retriever = VideoRAGRetriever(self.chunks, self.embedder)
        
        print(f"✓ Video processing complete. Total chunks: {len(self.chunks)}")
    
    def query(self, 
             query: str, 
             top_k: int = 3,
             include_context: bool = True) -> Dict:
        """
        Query the RAG engine and get relevant chunks.
        
        Args:
            query: Search query
            top_k: Number of results
            include_context: Include surrounding context
        
        Returns:
            Dictionary with results and metadata
        """
        if not self.retriever:
            return {"error": "No video processed yet"}
        
        # Retrieve relevant chunks
        results = self.retriever.retrieve(query, top_k=top_k)
        
        # Format results
        formatted_results = []
        for chunk, score in results:
            result = {
                'chunk_id': chunk.chunk_id,
                'start_time': chunk.start_time,
                'end_time': chunk.end_time,
                'timestamp': f"{chunk.format_timestamp(chunk.start_time)} - {chunk.format_timestamp(chunk.end_time)}",
                'duration': chunk.get_duration(),
                'transcript': chunk.transcript,
                'visual_description': chunk.visual_description,
                'scene_summary': chunk.scene_summary,
                'keywords': chunk.keywords,
                'relevance_score': score
            }
            
            # Add context from adjacent chunks if requested
            if include_context:
                result['context'] = self._get_chunk_context(chunk)
            
            formatted_results.append(result)
        
        return {
            'query': query,
            'num_results': len(formatted_results),
            'results': formatted_results
        }
    
    def _get_chunk_context(self, target_chunk: VideoChunk) -> Dict:
        """Get context from chunks before and after target"""
        target_idx = next(
            (i for i, c in enumerate(self.chunks) if c.chunk_id == target_chunk.chunk_id),
            None
        )
        
        context = {}
        if target_idx is not None:
            if target_idx > 0:
                prev_chunk = self.chunks[target_idx - 1]
                context['previous'] = {
                    'timestamp': prev_chunk.format_timestamp(prev_chunk.start_time),
                    'summary': prev_chunk.scene_summary[:100]
                }
            
            if target_idx < len(self.chunks) - 1:
                next_chunk = self.chunks[target_idx + 1]
                context['next'] = {
                    'timestamp': next_chunk.format_timestamp(next_chunk.start_time),
                    'summary': next_chunk.scene_summary[:100]
                }
        
        return context
    
    def save_index(self, filepath: str):
        """Save the RAG index to disk"""
        data = {
            'chunks': [chunk.to_dict() for chunk in self.chunks],
            'metadata': self.video_metadata
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Index saved to {filepath}")
    
    def load_index(self, filepath: str):
        """Load the RAG index from disk"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        self.chunks = [VideoChunk.from_dict(chunk_data) for chunk_data in data['chunks']]
        self.video_metadata = data['metadata']
        
        # Rebuild retriever
        if self.chunks:
            self.retriever = VideoRAGRetriever(self.chunks, self.embedder)
        
        print(f"Index loaded from {filepath}. Total chunks: {len(self.chunks)}")
    
    def get_stats(self) -> Dict:
        """Get statistics about the indexed content"""
        if not self.chunks:
            return {"error": "No chunks indexed"}
        
        total_duration = sum(c.get_duration() for c in self.chunks)
        
        return {
            'total_chunks': len(self.chunks),
            'total_duration_seconds': total_duration,
            'total_duration_formatted': str(timedelta(seconds=int(total_duration))),
            'avg_chunk_duration': total_duration / len(self.chunks),
            'min_chunk_duration': min(c.get_duration() for c in self.chunks),
            'max_chunk_duration': max(c.get_duration() for c in self.chunks),
            'total_keywords': sum(len(c.keywords) for c in self.chunks)
        }
