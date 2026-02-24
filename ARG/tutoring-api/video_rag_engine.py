"""
Video RAG Engine - Integrated into ARG
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
                
                # Reset for next chunk
                chunk_index += 1
                current_chunk_segments = []
                current_start = segment['end']
        
        # Handle remaining segments
        if current_chunk_segments and current_start is not None:
            chunk = self._create_chunk(
                chunk_index,
                current_start,
                current_chunk_segments[-1]['end'],
                current_chunk_segments,
                visual_data
            )
            chunks.append(chunk)
        
        return chunks
    
    def _is_semantic_boundary(self, segment: Dict, current_segments: List[Dict]) -> bool:
        """Detect if current segment represents a semantic boundary"""
        # Simple heuristic: look for topic change indicators
        boundary_indicators = [
            "now let's", "next", "finally", "in conclusion",
            "moving on", "let's talk about", "another important"
        ]
        
        text = segment['text'].lower()
        return any(indicator in text for indicator in boundary_indicators)
    
    def _create_chunk(self, 
                    chunk_index: int,
                    start_time: float,
                    end_time: float,
                    segments: List[Dict],
                    visual_data: Optional[List[Dict]]) -> VideoChunk:
        """Create a VideoChunk from segments"""
        
        # Combine transcript text
        transcript = " ".join(seg['text'] for seg in segments)
        
        # Generate visual description (placeholder)
        visual_description = self._generate_visual_description(segments, visual_data)
        
        # Generate scene summary
        scene_summary = self._generate_scene_summary(transcript)
        
        # Extract keywords
        keywords = self._extract_keywords(transcript)
        
        return VideoChunk(
            chunk_id=f"chunk_{chunk_index:03d}",
            start_time=start_time,
            end_time=end_time,
            transcript=transcript,
            visual_description=visual_description,
            scene_summary=scene_summary,
            keywords=keywords
        )
    
    def _generate_visual_description(self, segments: List[Dict], visual_data: Optional[List[Dict]]) -> str:
        """Generate visual description for the chunk"""
        # Placeholder implementation
        return "Visual content related to the transcript segment"
    
    def _generate_scene_summary(self, transcript: str) -> str:
        """Generate a summary of the scene"""
        # Simple extractive summarization
        sentences = transcript.split('. ')
        if len(sentences) <= 2:
            return transcript
        
        # Return first and last sentences as summary
        return f"{sentences[0]}. {sentences[-1]}"
    
    def _extract_keywords(self, transcript: str) -> List[str]:
        """Extract keywords from transcript"""
        # Simple keyword extraction
        words = transcript.lower().split()
        # Filter out common words and return unique words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
        keywords = [word for word in words if word not in stop_words and len(word) > 3]
        return list(set(keywords[:10]))  # Return top 10 unique keywords


class VideoRAGEngine:
    """Main Video RAG Engine"""
    
    def __init__(self, 
                 embedding_model: str = "all-MiniLM-L6-v2",
                 chunk_strategy: str = "semantic"):
        self.embedding_model_name = embedding_model
        self.chunk_strategy = chunk_strategy
        self.chunker = VideoChunker()
        self.embeddings_model = None
        self.chunks: List[VideoChunk] = []
    
    def _load_embedding_model(self):
        """Load embedding model lazily"""
        if self.embeddings_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self.embeddings_model = SentenceTransformer(self.embedding_model_name)
            except ImportError:
                raise ImportError("sentence-transformers not installed. Install with: pip install sentence-transformers")
    
    def process_video(self, 
                     transcript_segments: List[Dict],
                     visual_data: Optional[List[Dict]] = None) -> List[VideoChunk]:
        """
        Process video transcript into chunks and generate embeddings
        
        Args:
            transcript_segments: List of transcript segments with 'start', 'end', 'text'
            visual_data: Optional visual scene data
        
        Returns:
            List of processed VideoChunk objects
        """
        # Create chunks
        self.chunks = self.chunker.chunk_by_transcript(transcript_segments, visual_data)
        
        # Generate embeddings
        self._generate_embeddings()
        
        return self.chunks
    
    def _generate_embeddings(self):
        """Generate embeddings for all chunks"""
        if not self.chunks:
            return
        
        self._load_embedding_model()
        
        # Generate embeddings for transcript text
        texts = [chunk.transcript for chunk in self.chunks]
        embeddings = self.embeddings_model.encode(texts)
        
        # Assign embeddings to chunks
        for chunk, embedding in zip(self.chunks, embeddings):
            chunk.embedding = embedding
    
    def retrieve(self, query: str, top_k: int = 5) -> List[Tuple[VideoChunk, float]]:
        """
        Retrieve relevant chunks for a query
        
        Args:
            query: Search query
            top_k: Number of chunks to retrieve
        
        Returns:
            List of (VideoChunk, similarity_score) tuples
        """
        if not self.chunks:
            return []
        
        self._load_embedding_model()
        
        # Generate query embedding
        query_embedding = self.embeddings_model.encode([query])[0]
        
        # Calculate similarities
        similarities = []
        for chunk in self.chunks:
            if chunk.embedding is not None:
                similarity = np.dot(chunk.embedding, query_embedding) / (
                    np.linalg.norm(chunk.embedding) * np.linalg.norm(query_embedding)
                )
                similarities.append((chunk, float(similarity)))
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
    
    def save_chunks(self, filepath: str):
        """Save chunks to file"""
        data = {
            'chunks': [chunk.to_dict() for chunk in self.chunks],
            'metadata': {
                'embedding_model': self.embedding_model_name,
                'chunk_strategy': self.chunk_strategy,
                'total_chunks': len(self.chunks)
            }
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_chunks(self, filepath: str):
        """Load chunks from file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        self.chunks = [VideoChunk.from_dict(chunk_data) for chunk_data in data['chunks']]
        self.embedding_model_name = data['metadata']['embedding_model']
        self.chunk_strategy = data['metadata']['chunk_strategy']
    
    def get_chunk_statistics(self) -> Dict:
        """Get statistics about chunks"""
        if not self.chunks:
            return {}
        
        durations = [chunk.get_duration() for chunk in self.chunks]
        
        return {
            'total_chunks': len(self.chunks),
            'total_duration': sum(durations),
            'avg_duration': sum(durations) / len(durations),
            'min_duration': min(durations),
            'max_duration': max(durations),
            'embedding_model': self.embedding_model_name,
            'chunk_strategy': self.chunk_strategy
        }
    
    def format_retrieval_context(self, 
                               retrieval_results: List[Tuple[VideoChunk, float]],
                               include_timestamps: bool = True,
                               include_scores: bool = True) -> str:
        """
        Format retrieval results for LLM context
        
        Args:
            retrieval_results: List of (VideoChunk, similarity_score) tuples
            include_timestamps: Whether to include timestamps
            include_scores: Whether to include similarity scores
        
        Returns:
            Formatted context string
        """
        context_parts = []
        
        for i, (chunk, score) in enumerate(retrieval_results, 1):
            chunk_text = f"Chunk {i}:"
            
            if include_timestamps:
                chunk_text += f" [{chunk.format_timestamp(chunk.start_time)} - {chunk.format_timestamp(chunk.end_time)}]"
            
            if include_scores:
                chunk_text += f" (Score: {score:.3f})"
            
            chunk_text += f"\n{chunk.transcript}\n"
            context_parts.append(chunk_text)
        
        return "\n".join(context_parts)


def demo_rag_query(engine: VideoRAGEngine, query: str, top_k: int = 3):
    """Demo function to show RAG query results"""
    print(f"\n🔍 Query: '{query}'")
    
    # Retrieve relevant chunks
    results = engine.retrieve(query, top_k)
    
    if not results:
        print("  No relevant chunks found.")
        return None, None
    
    print(f"  Found {len(results)} relevant chunks:")
    
    # Format context for LLM
    context = engine.format_retrieval_context(results)
    
    # Display results
    for chunk, score in results:
        print(f"    - Chunk {chunk.chunk_id} (Score: {score:.3f})")
        print(f"      Time: {chunk.format_timestamp(chunk.start_time)} - {chunk.format_timestamp(chunk.end_time)}")
        print(f"      Preview: {chunk.transcript[:100]}...")
    
    print(f"\n📝 Generated LLM Context:")
    print("-" * 60)
    print(context[:500] + "..." if len(context) > 500 else context)
    
    return results, context
