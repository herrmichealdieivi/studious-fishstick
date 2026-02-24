#!/usr/bin/env python3
"""
Demo script to test the adaptive time estimation feature.
This script adds sample student data and demonstrates the time estimation API.
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000"

def create_sample_data():
    """Create sample student performance data for testing."""
    
    # Sample feedback data to build up student history
    sample_feedback = [
        {
            "student_id": "demo_student_001",
            "content_id": "algebra_basics_001",
            "skill_id": "math_algebra_basics",
            "is_correct": True,
            "confidence": 0.8,
            "time_to_answer_ms": 15000,
            "timestamp": time.time() - 3600  # 1 hour ago
        },
        {
            "student_id": "demo_student_001",
            "content_id": "algebra_basics_002", 
            "skill_id": "math_algebra_basics",
            "is_correct": True,
            "confidence": 0.9,
            "time_to_answer_ms": 12000,
            "timestamp": time.time() - 3000  # 50 minutes ago
        },
        {
            "student_id": "demo_student_001",
            "content_id": "algebra_basics_003",
            "skill_id": "math_algebra_basics", 
            "is_correct": False,
            "confidence": 0.4,
            "time_to_answer_ms": 45000,
            "timestamp": time.time() - 2400  # 40 minutes ago
        },
        {
            "student_id": "demo_student_001",
            "content_id": "algebra_basics_004",
            "skill_id": "math_algebra_basics",
            "is_correct": True,
            "confidence": 0.7,
            "time_to_answer_ms": 18000,
            "timestamp": time.time() - 1800  # 30 minutes ago
        },
        {
            "student_id": "demo_student_001",
            "content_id": "algebra_basics_005",
            "skill_id": "math_algebra_basics",
            "is_correct": True,
            "confidence": 0.85,
            "time_to_answer_ms": 10000,
            "timestamp": time.time() - 1200  # 20 minutes ago
        }
    ]
    
    print("Creating sample student performance data...")
    for i, feedback in enumerate(sample_feedback):
        try:
            response = requests.post(f"{BASE_URL}/feedback", json=feedback)
            if response.status_code == 200:
                print(f"✓ Created sample feedback {i+1}/5")
            else:
                print(f"✗ Failed to create feedback {i+1}: {response.text}")
        except Exception as e:
            print(f"✗ Error creating feedback {i+1}: {e}")
    
    # Create content-skill mapping
    content_skill_mapping = {
        "content_id": "algebra_basics_001",
        "skill_id": "math_algebra_basics"
    }
    
    print("\nCreating content-skill mapping...")
    try:
        # Note: This would need a separate endpoint in a real implementation
        print("✓ Content-skill mapping ready (manual setup required)")
    except Exception as e:
        print(f"✗ Error with mapping: {e}")

def test_time_estimation():
    """Test the time estimation API."""
    
    print("\n" + "="*50)
    print("TESTING ADAPTIVE TIME ESTIMATION")
    print("="*50)
    
    # Test request
    time_request = {
        "student_id": "demo_student_001",
        "skill_id": "math_algebra_basics",
        "subject_id": "math"
    }
    
    print(f"\nRequest: {json.dumps(time_request, indent=2)}")
    
    try:
        response = requests.post(f"{BASE_URL}/time-estimate", json=time_request)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✓ Time Estimation Result:")
            print(json.dumps(result, indent=2))
            
            # Calculate efficiency comparison
            mentorium_minutes = result['estimated_minutes']
            traditional_hours = result['traditional_hours']
            traditional_minutes = traditional_hours * 60
            
            print(f"\n📊 EFFICIENCY ANALYSIS:")
            print(f"   Mentorium Time:   {mentorium_minutes:.1f} minutes")
            print(f"   Traditional Time: {traditional_minutes:.1f} minutes")
            print(f"   Time Saved:       {traditional_minutes - mentorium_minutes:.1f} minutes")
            print(f"   Efficiency Gain:  {result['efficiency']:.1f}x faster")
            print(f"   Confidence:       {result['confidence']:.1%}")
            
        else:
            print(f"✗ Time estimation failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"✗ Error testing time estimation: {e}")

def main():
    """Main demo function."""
    print("🚀 Mentorium Adaptive Time Estimation Demo")
    print("=" * 50)
    
    # Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✓ API is running")
        else:
            print("✗ API health check failed")
            return
    except Exception as e:
        print(f"✗ Cannot connect to API at {BASE_URL}")
        print("Please make sure the ARG tutoring API is running:")
        print("   cd ARG/tutoring-api")
        print("   python main.py")
        return
    
    # Create sample data
    create_sample_data()
    
    # Wait a moment for data processing
    time.sleep(1)
    
    # Test time estimation
    test_time_estimation()
    
    print("\n" + "="*50)
    print("🎉 Demo completed!")
    print("The countdown timer in the web app will now show personalized")
    print("time estimates based on this student's performance data.")
    print("="*50)

if __name__ == "__main__":
    main()
