"""
Demo: Video RAG Engine Complete Example
Shows all features working together with sample data and new semantic chunking
"""

from video_rag_engine import VideoRAGEngine, demo_rag_query
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
            "text": "Training a neural network involves feeding it examples and adjusting the weights through a process called backpropagation. This allows the network to learn patterns from data."
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


def demo_semantic_chunking_without_video():
    """Demonstrate semantic chunking using transcript data only (no video file needed)"""
    print("\n" + "="*80)
    print("DEMO: Semantic Video RAG (Using Transcript Data)")
    print("="*80 + "\n")
    
    # Initialize engine
    print("Initializing Video RAG Engine...")
    engine = VideoRAGEngine(
        embedding_model="all-MiniLM-L6-v2",
        chunk_strategy="semantic"
    )
    
    # Get sample data
    segments = create_sample_video_data()
    
    # Manually create chunks using the semantic chunking logic
    print("\nProcessing transcript segments...")
    chunks = engine._chunk_semantic(
        segments,
        similarity_threshold=0.7,
        min_chunk_duration=20.0,
        max_chunk_duration=60.0
    )
    
    # Set chunks and generate embeddings
    engine.chunks = chunks
    engine._generate_embeddings()
    
    print(f"\n✓ Created {len(engine.chunks)} semantic chunks")
    
    # Display chunk information
    print("\n" + "-"*80)
    print("Chunk Overview:")
    print("-"*80)
    for chunk in engine.chunks:
        duration = chunk.get_duration()
        print(f"\nChunk {chunk.chunk_id}:")
        print(f"  Time: {chunk.format_timestamp(chunk.start_time)} - {chunk.format_timestamp(chunk.end_time)} ({duration:.1f}s)")
        print(f"  Summary: {chunk.summary}")
        print(f"  Preview: {chunk.text[:80]}...")
    
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
    engine.save_chunks("demo_chunks.json")
    print("\n✓ Saved chunks to demo_chunks.json")
    
    return engine


def demo_fixed_time_chunking():
    """Demonstrate fixed-time chunking strategy"""
    print("\n" + "="*80)
    print("DEMO: Fixed-Time Chunking")
    print("="*80 + "\n")
    
    # Initialize with fixed-time strategy
    engine = VideoRAGEngine(
        embedding_model="all-MiniLM-L6-v2",
        chunk_strategy="fixed_time"
    )
    
    # Get sample data
    segments = create_sample_video_data()
    
    # Create fixed-time chunks
    print("Creating 45-second chunks...")
    chunks = engine._chunk_fixed_time(segments, duration=45.0)
    
    # Set chunks and generate embeddings
    engine.chunks = chunks
    engine._generate_embeddings()
    
    print(f"\n✓ Created {len(engine.chunks)} fixed-time chunks")
    
    # Display chunks
    print("\nChunks:")
    for chunk in engine.chunks:
        print(f"  Chunk {chunk.chunk_id}: {chunk.format_timestamp(chunk.start_time)} - {chunk.format_timestamp(chunk.end_time)}")
    
    return engine


def demo_advanced_retrieval():
    """Demonstrate advanced retrieval patterns"""
    print("\n" + "="*80)
    print("DEMO: Advanced Retrieval Patterns")
    print("="*80 + "\n")
    
    # Load saved chunks
    engine = VideoRAGEngine()
    
    try:
        engine.load_chunks("demo_chunks.json")
    except FileNotFoundError:
        print("Running semantic chunking demo first to create chunks...")
        engine = demo_semantic_chunking_without_video()
    
    # Multi-query retrieval
    queries = ["neural networks", "training", "applications"]
    
    print("Multi-query retrieval:")
    for query in queries:
        results = engine.retrieve(query, top_k=2)
        print(f"\n'{query}':")
        for chunk, score in results:
            print(f"  - Chunk {chunk.chunk_id} (Score: {score:.3f}) - {chunk.summary}")
    
    # Time-range filtering
    print("\n\nTime-range filtering (first minute):")
    first_minute_chunks = [
        chunk for chunk in engine.chunks 
        if chunk.start_time < 60.0
    ]
    
    for chunk in first_minute_chunks:
        print(f"  - {chunk.format_timestamp(chunk.start_time)}: {chunk.summary}")
    
    # Create video timeline
    print("\n\nVideo Timeline:")
    for chunk in engine.chunks:
        timestamp = chunk.format_timestamp(chunk.start_time)
        print(f"  {timestamp} - {chunk.summary}")


def demo_llm_context_formatting():
    """Demonstrate LLM context formatting for different use cases"""
    print("\n" + "="*80)
    print("DEMO: LLM Context Formatting")
    print("="*80 + "\n")
    
    # Load engine
    engine = VideoRAGEngine()
    
    try:
        engine.load_chunks("demo_chunks.json")
    except FileNotFoundError:
        print("Running semantic chunking demo first to create chunks...")
        engine = demo_semantic_chunking_without_video()
    
    # Different analysis scenarios
    scenarios = [
        {
            "task": "Summarization",
            "query": "neural networks deep learning",
            "instruction": "Provide a comprehensive summary of the video content"
        },
        {
            "task": "Q&A",
            "query": "What are the components of a neural network?",
            "instruction": "Answer the question based on the video content"
        },
        {
            "task": "Extraction",
            "query": "frameworks tools mentioned",
            "instruction": "Extract all frameworks and tools mentioned in the video"
        }
    ]
    
    for scenario in scenarios:
        print(f"\n{'='*60}")
        print(f"Task: {scenario['task']}")
        print(f"{'='*60}")
        
        # Retrieve relevant chunks
        results = engine.retrieve(scenario['query'], top_k=3)
        context = engine.format_retrieval_context(results, include_timestamps=True)
        
        # Create LLM prompt
        llm_prompt = f"""Video Analysis Task: {scenario['instruction']}

Retrieved Video Sections:
{context}

Task: {scenario['instruction']}

Please analyze the above video sections and respond accordingly."""
        
        print("\nGenerated LLM Prompt:")
        print("-" * 60)
        print(llm_prompt[:500] + "..." if len(llm_prompt) > 500 else llm_prompt)


def main():
    """Run all demos"""
    print("\n" + "#"*80)
    print("# VIDEO RAG ENGINE - COMPREHENSIVE DEMO")
    print("#"*80)
    
    print("\n📝 This demo shows the Video RAG Engine working with sample transcript data")
    print("   (No actual video file required!)\n")
    
    # Run demos
    print("\n🎬 Demo 1: Semantic Chunking")
    engine1 = demo_semantic_chunking_without_video()
    
    input("\n\nPress Enter to continue to Demo 2...")
    
    print("\n🎬 Demo 2: Fixed-Time Chunking")
    engine2 = demo_fixed_time_chunking()
    
    input("\n\nPress Enter to continue to Demo 3...")
    
    print("\n🎬 Demo 3: Advanced Retrieval")
    demo_advanced_retrieval()
    
    input("\n\nPress Enter to continue to Demo 4...")
    
    print("\n🎬 Demo 4: LLM Context Formatting")
    demo_llm_context_formatting()
    
    print("\n" + "="*80)
    print("✅ All demos completed successfully!")
    print("="*80)
    
    print("\n📊 Key Takeaways:")
    print("  - Semantic chunking creates intelligent topic-based segments")
    print("  - Retrieval finds relevant sections based on query similarity")
    print("  - Context formatting prepares data for LLM analysis")
    print("  - The system works with transcripts (no video processing required)")
    
    print("\n🚀 Next Steps:")
    print("  1. Try with your own video files using Whisper transcription")
    print("  2. Integrate with your LLM of choice (OpenAI, Anthropic, etc.)")
    print("  3. Customize chunking parameters for your use case")
    print("  4. Build a web interface for interactive querying")


if __name__ == "__main__":
    main()
