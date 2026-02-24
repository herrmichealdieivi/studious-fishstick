"""
Demo: Video RAG Engine Complete Example - ARG Integration
Shows all features working together with sample data and new semantic chunking
"""

from video_rag_engine import VideoRAGEngine, demo_rag_query
from temporal_video_rag_engine import TemporalVideoRAGEngine
import json
import numpy as np


def create_sample_video_data():
    """Create sample video transcript data for testing"""
    return [
        {
            "start": 0.0,
            "end": 15.0,
            "text": "Welcome to this comprehensive guide on machine learning. Today we'll explore the fundamentals of neural networks and how they power modern AI systems."
        },
        {
            "start": 15.0,
            "end": 35.0,
            "text": "Neural networks are computational models inspired by biological brains. They consist of interconnected layers of neurons that process information through weighted connections."
        },
        {
            "start": 35.0,
            "end": 55.0,
            "text": "Let's start with the basics. A neural network has three main components: an input layer that receives data, hidden layers that process the data, and an output layer that produces predictions."
        },
        {
            "start": 55.0,
            "end": 75.0,
            "text": "Training a neural network involves feeding it examples and adjusting weights through a process called backpropagation. This allows the network to learn patterns from data."
        },
        {
            "start": 75.0,
            "end": 95.0,
            "text": "Deep learning refers to neural networks with many hidden layers. These deep architectures can learn increasingly complex and abstract features from raw data."
        },
        {
            "start": 95.0,
            "end": 115.0,
            "text": "Common applications include image recognition, natural language processing, and autonomous vehicles. The key is having enough training data and computational power."
        },
        {
            "start": 115.0,
            "end": 135.0,
            "text": "When implementing neural networks, you'll use frameworks like TensorFlow or PyTorch. These provide high-level APIs for building and training models efficiently."
        },
        {
            "start": 135.0,
            "end": 155.0,
            "text": "To avoid overfitting, we use techniques like dropout, regularization, and data augmentation. These help the model generalize better to unseen data."
        },
        {
            "start": 155.0,
            "end": 175.0,
            "text": "In conclusion, neural networks are powerful tools that have revolutionized AI. By understanding their fundamentals, you can build sophisticated machine learning systems."
        },
        {
            "start": 175.0,
            "end": 185.0,
            "text": "Thank you for watching this introduction to neural networks. Check out the next video for hands-on examples and code implementations."
        }
    ]


def demo_basic_video_rag():
    """Demonstrate basic video RAG functionality"""
    print("\n" + "="*80)
    print("DEMO: Basic Video RAG Engine")
    print("="*80 + "\n")
    
    # Initialize engine
    print("Initializing Video RAG Engine...")
    engine = VideoRAGEngine(
        embedding_model="all-MiniLM-L6-v2",
        chunk_strategy="semantic"
    )
    
    # Get sample data
    segments = create_sample_video_data()
    
    # Process video
    print("\nProcessing video transcript...")
    chunks = engine.process_video(segments)
    
    print(f"\n✓ Created {len(chunks)} semantic chunks")
    
    # Display chunk information
    print("\n" + "-"*80)
    print("Chunk Overview:")
    print("-"*80)
    for chunk in chunks:
        duration = chunk.get_duration()
        print(f"\nChunk {chunk.chunk_id}:")
        print(f"  Time: {chunk.format_timestamp(chunk.start_time)} - {chunk.format_timestamp(chunk.end_time)} ({duration:.1f}s)")
        print(f"  Summary: {chunk.scene_summary}")
        print(f"  Preview: {chunk.transcript[:80]}...")
    
    # Get statistics
    stats = engine.get_chunk_statistics()
    print("\n" + "-"*80)
    print("Chunk Statistics:")
    print("-"*80)
    for key, value in stats.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.2f}")
        else:
            print(f"  {key}: {value}")
    
    # Test retrieval with various queries
    test_queries = [
        "What are the main components of a neural network?",
        "How do you train neural networks?",
        "What frameworks are mentioned for implementing neural networks?",
        "What techniques prevent overfitting?",
        "What are common applications of neural networks?"
    ]
    
    print("\n" + "="*80)
    print("Testing Retrieval & LLM Context Generation")
    print("="*80)
    
    for query in test_queries[:3]:  # Show first 3 for demo
        results, context = demo_rag_query(engine, query, top_k=2)
    
    # Save chunks for later use
    engine.save_chunks("demo_video_chunks.json")
    print("\n✓ Saved chunks to demo_video_chunks.json")
    
    return engine


def demo_temporal_video_rag():
    """Demonstrate temporal video RAG functionality"""
    print("\n" + "="*80)
    print("DEMO: Temporal Video RAG Engine")
    print("="*80 + "\n")
    
    # Initialize temporal engine
    print("Initializing Temporal Video RAG Engine...")
    engine = TemporalVideoRAGEngine()
    
    # Create demo data
    video_id = "ml_lecture_001"
    print(f"\nCreating demo chunks for {video_id}...")
    chunks = engine.create_demo_chunks(video_id)
    
    print(f"\n✓ Created {len(chunks)} demo chunks")
    
    # Test different types of queries
    test_queries = [
        ("What are neural networks?", "semantic"),
        ("What was mentioned earlier about training?", "temporal_earlier"),
        ("What applications did they discuss?", "semantic"),
        ("What was said at the beginning?", "temporal_earlier"),
        ("Tell me more about that", "anaphoric"),
        ("What comes next?", "temporal_later")
    ]
    
    print("\n" + "="*80)
    print("Testing Temporal-Aware Queries")
    print("="*80)
    
    for i, (query, query_type) in enumerate(test_queries, 1):
        print(f"\n{i}. 🔍 Query: '{query}' (Type: {query_type})")
        
        # Set a playback position for temporal queries
        if query_type.startswith("temporal"):
            engine.set_playback_position(45.0)  # Middle of video
        
        # Analyze with context
        result = engine.analyze_with_context(query, video_id, top_k=2)
        
        print(f"  Strategy: {result['context_info']['retrieval_strategy']}")
        print(f"  Chunks retrieved: {result['num_chunks_retrieved']}")
        
        # Show retrieved chunks
        for chunk_data in result['chunks']:
            print(f"    - {chunk_data['chunk_id']}: [{chunk_data['start_time']:.1f}s - {chunk_data['end_time']:.1f}s]")
            print(f"      {chunk_data['summary']}")
    
    # Save conversation
    engine.save_conversation(video_id, "demo_session")
    print("\n✓ Conversation saved")
    
    return engine


def demo_integration_scenario():
    """Demonstrate how both engines work together"""
    print("\n" + "="*80)
    print("DEMO: Integration Scenario - ARG + RAG")
    print("="*80 + "\n")
    
    print("This demo shows how Video RAG integrates with the ARG tutoring system:")
    print("1. Student watches a video lesson")
    print("2. System chunks the video semantically")
    print("3. Student asks questions with temporal context")
    print("4. System retrieves relevant chunks and provides context")
    print("5. LLM generates personalized answers")
    
    # Initialize both engines
    basic_engine = VideoRAGEngine()
    temporal_engine = TemporalVideoRAGEngine()
    
    # Process the same content with both engines
    segments = create_sample_video_data()
    
    # Basic processing for chunking
    chunks = basic_engine.process_video(segments)
    print(f"\n✓ Processed video into {len(chunks)} semantic chunks")
    
    # Create temporal engine data
    video_id = "integrated_lesson"
    temporal_engine.create_demo_chunks(video_id)
    
    # Simulate student interaction
    print("\n" + "-"*60)
    print("Simulating Student Interaction:")
    print("-"*60)
    
    interactions = [
        {
            "time": 30.0,
            "question": "What are the main components of a neural network?",
            "context": "Student is at beginning of video"
        },
        {
            "time": 60.0,
            "question": "What was mentioned earlier about training?",
            "context": "Student referring to earlier content"
        },
        {
            "time": 90.0,
            "question": "Tell me more about those applications",
            "context": "Student referring to previously mentioned applications"
        }
    ]
    
    for i, interaction in enumerate(interactions, 1):
        print(f"\n{i}. Time: {interaction['time']}s - {interaction['context']}")
        print(f"   Question: {interaction['question']}")
        
        # Set playback position
        temporal_engine.set_playback_position(interaction['time'])
        
        # Analyze with temporal context
        result = temporal_engine.analyze_with_context(
            interaction['question'], 
            video_id, 
            top_k=2
        )
        
        print(f"   → Retrieved {result['num_chunks_retrieved']} chunks")
        print(f"   → Strategy: {result['context_info']['retrieval_strategy']}")
        
        # Show first chunk preview
        if result['chunks']:
            chunk = result['chunks'][0]
            preview = chunk['transcript'][:100] + "..." if len(chunk['transcript']) > 100 else chunk['transcript']
            print(f"   → Preview: {preview}")
    
    print("\n✅ Integration demo completed!")


def main():
    """Run all demos"""
    print("\n" + "#"*80)
    print("# VIDEO RAG ENGINE - ARG INTEGRATION DEMO")
    print("#"*80)
    
    print("\n📝 This demo shows Video RAG Engine capabilities integrated into ARG")
    print("   (No actual video files required!)\n")
    
    # Run demos
    print("\n🎬 Demo 1: Basic Video RAG")
    engine1 = demo_basic_video_rag()
    
    input("\n\nPress Enter to continue to Demo 2...")
    
    print("\n🎬 Demo 2: Temporal Video RAG")
    engine2 = demo_temporal_video_rag()
    
    input("\n\nPress Enter to continue to Demo 3...")
    
    print("\n🎬 Demo 3: Integration Scenario")
    demo_integration_scenario()
    
    print("\n" + "="*80)
    print("✅ All demos completed successfully!")
    print("="*80)
    
    print("\n📊 Key Takeaways:")
    print("  - Basic RAG provides semantic chunking and retrieval")
    print("  - Temporal RAG adds time-awareness and conversation context")
    print("  - Both engines integrate seamlessly with ARG tutoring system")
    print("  - System works with transcripts (no video processing required)")
    
    print("\n🚀 Integration Benefits:")
    print("  1. Enhanced video learning experience")
    print("  2. Context-aware question answering")
    print("  3. Temporal reference resolution")
    print("  4. Conversation history tracking")
    print("  5. Seamless integration with existing ARG BKT system")


if __name__ == "__main__":
    main()
