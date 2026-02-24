#!/usr/bin/env python3
"""
Complete demo script for the Mentorium Gamified Learning System.
This demonstrates the full countdown timer, rewards, badges, and analytics features.
"""

import requests
import json
import time
import random

# API base URL
BASE_URL = "http://localhost:8000"

def create_comprehensive_demo_data():
    """Create rich demo data showcasing all gamification features."""
    
    print("🎮 Creating comprehensive gamified learning demo...")
    
    # Create multiple students with different performance profiles
    students = [
        {
            "student_id": "speed_learner_001",
            "profile": "fast_learner",
            "description": "Completes lessons quickly and efficiently"
        },
        {
            "student_id": "steady_learner_002", 
            "profile": "consistent",
            "description": "Steady progress with good timing"
        },
        {
            "student_id": "struggling_learner_003",
            "profile": "needs_improvement",
            "description": "Takes longer but improving"
        },
        {
            "student_id": "streak_warrior_004",
            "profile": "daily_habit",
            "description": "Maintains consistent daily streak"
        }
    ]
    
    skills = [
        {"skill_id": "math_algebra_basics", "difficulty": "beginner"},
        {"skill_id": "math_geometry_fundamentals", "difficulty": "intermediate"},
        {"skill_id": "math_advanced_calculus", "difficulty": "advanced"},
        {"skill_id": "science_physics_intro", "difficulty": "intermediate"},
        {"skill_id": "programming_python_basics", "difficulty": "beginner"}
    ]
    
    # Generate performance data for each student
    for student in students:
        print(f"\n📚 Creating data for {student['student_id']} ({student['description']})...")
        
        for skill in skills:
            # Generate 5-10 lessons per skill
            lessons_count = random.randint(5, 10)
            
            for lesson_num in range(1, lessons_count + 1):
                # Simulate different performance profiles
                if student['profile'] == 'fast_learner':
                    # Fast learner: under time, high accuracy
                    actual_time = random.uniform(8, 15)  # minutes
                    estimated_time = random.uniform(20, 30)
                    accuracy = random.uniform(0.85, 1.0)
                    response_time = random.uniform(5000, 15000)  # ms
                    
                elif student['profile'] == 'consistent':
                    # Consistent learner: near estimated time
                    actual_time = random.uniform(18, 25)
                    estimated_time = random.uniform(20, 30)
                    accuracy = random.uniform(0.75, 0.9)
                    response_time = random.uniform(10000, 25000)
                    
                elif student['profile'] == 'needs_improvement':
                    # Struggling learner: over time, lower accuracy
                    actual_time = random.uniform(30, 45)
                    estimated_time = random.uniform(20, 30)
                    accuracy = random.uniform(0.4, 0.7)
                    response_time = random.uniform(25000, 45000)
                    
                else:  # daily_habit
                    # Daily habit: varied but generally good
                    actual_time = random.uniform(12, 28)
                    estimated_time = random.uniform(20, 30)
                    accuracy = random.uniform(0.7, 0.95)
                    response_time = random.uniform(8000, 20000)
                
                # Create feedback events
                feedback = {
                    "student_id": student['student_id'],
                    "content_id": f"{skill['skill_id']}_lesson_{lesson_num}",
                    "skill_id": skill['skill_id'],
                    "is_correct": random.random() < accuracy,
                    "confidence": accuracy,
                    "time_to_answer_ms": int(response_time),
                    "timestamp": time.time() - (lessons_count - lesson_num) * 3600  # Spaced by hours
                }
                
                try:
                    response = requests.post(f"{BASE_URL}/feedback", json=feedback)
                    if response.status_code == 200:
                        print(f"  ✓ Created lesson {lesson_num} for {skill['skill_id']}")
                except Exception as e:
                    print(f"  ✗ Error creating lesson: {e}")
                
                # Simulate lesson completion with rewards
                lesson_complete = {
                    "student_id": student['student_id'],
                    "skill_id": skill['skill_id'],
                    "subject_id": skill['skill_id'].split('_')[0],
                    "actual_time_seconds": actual_time * 60,
                    "estimated_time_seconds": estimated_time * 60,
                    "points_earned": 100,
                    "bonus_points": max(0, int((estimated_time - actual_time) * 2))
                }
                
                try:
                    response = requests.post(f"{BASE_URL}/lesson-complete", json=lesson_complete)
                    if response.status_code == 200:
                        result = response.json()
                        print(f"  🏆 Lesson complete: {result['total_points']} points, streak: {result['streak']}")
                        if result['new_badges']:
                            print(f"    🎖️  New badges: {', '.join(result['new_badges'])}")
                except Exception as e:
                    print(f"  ✗ Error completing lesson: {e}")

def demonstrate_analytics():
    """Show analytics and marketing data."""
    
    print("\n📊 GENERATING ANALYTICS & MARKETING DATA")
    print("=" * 50)
    
    # Get leaderboard data
    try:
        response = requests.get(f"{BASE_URL}/leaderboard?limit=10")
        if response.status_code == 200:
            leaderboard = response.json()
            
            print("\n🏆 TOP PERFORMERS:")
            for i, entry in enumerate(leaderboard[:5], 1):
                print(f"  {i}. {entry['student_id']}")
                print(f"     Points: {entry['total_points']} | Streak: {entry['current_streak']} days")
                print(f"     Efficiency: {entry['average_efficiency']:.1f}x | Lessons: {entry['lessons_completed']}")
                print()
            
            # Marketing insights
            total_points = sum(entry['total_points'] for entry in leaderboard)
            avg_efficiency = sum(entry['average_efficiency'] for entry in leaderboard) / len(leaderboard)
            total_lessons = sum(entry['lessons_completed'] for entry in leaderboard)
            
            print("📈 MARKETING INSIGHTS:")
            print(f"   • Total points earned: {total_points:,}")
            print(f"   • Average learning efficiency: {avg_efficiency:.1f}x faster than traditional")
            print(f"   • Total lessons completed: {total_lessons}")
            print(f"   • Time saved: {(total_lessons * 60 * (avg_efficiency - 1)):.0f} minutes vs traditional learning")
            print(f"   • Engagement rate: {len(leaderboard)} active learners")
            
    except Exception as e:
        print(f"✗ Error fetching analytics: {e}")

def demonstrate_individual_student():
    """Show individual student progress and achievements."""
    
    print("\n👤 STUDENT PROFILES & ACHIEVEMENTS")
    print("=" * 50)
    
    students = ["speed_learner_001", "steady_learner_002", "struggling_learner_003", "streak_warrior_004"]
    
    for student_id in students:
        try:
            response = requests.get(f"{BASE_URL}/student-stats/{student_id}")
            if response.status_code == 200:
                stats = response.json()
                
                print(f"\n🎓 {student_id}:")
                print(f"   Total Points: {stats['total_points']}")
                print(f"   Current Streak: {stats['current_streak']} days (Longest: {stats['longest_streak']})")
                print(f"   Lessons Completed: {stats['lessons_completed']}")
                print(f"   On-Time Rate: {(stats['lessons_under_time'] / stats['lessons_completed'] * 100):.1f}%")
                print(f"   Average Efficiency: {stats['average_efficiency']:.1f}x")
                
                if stats['badges']:
                    print(f"   🏅 Badges ({len(stats['badges'])}):")
                    for badge in stats['badges']:
                        print(f"      • {badge['name']}: {badge['description']}")
                else:
                    print(f"   🏅 No badges earned yet")
                    
        except Exception as e:
            print(f"✗ Error fetching stats for {student_id}: {e}")

def demonstrate_time_estimation():
    """Show adaptive time estimation for different students."""
    
    print("\n⏱️  ADAPTIVE TIME ESTIMATION DEMO")
    print("=" * 50)
    
    test_cases = [
        {"student_id": "speed_learner_001", "skill_id": "math_algebra_basics", "description": "Fast learner on basic skill"},
        {"student_id": "struggling_learner_003", "skill_id": "math_advanced_calculus", "description": "Struggling learner on advanced skill"},
        {"student_id": "steady_learner_002", "skill_id": "programming_python_basics", "description": "Consistent learner on new skill"}
    ]
    
    for case in test_cases:
        try:
            response = requests.post(f"{BASE_URL}/time-estimate", json={
                "student_id": case['student_id'],
                "skill_id": case['skill_id'],
                "subject_id": case['skill_id'].split('_')[0]
            })
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n📊 {case['description']}:")
                print(f"   Mentorium Time: {result['estimated_minutes']:.1f} minutes")
                print(f"   Traditional Time: {result['traditional_hours']:.1f} hours")
                print(f"   Efficiency: {result['efficiency']:.1f}x faster")
                print(f"   Confidence: {result['confidence']:.1%}")
                print(f"   Mastery Level: {result['mastery_level']:.1%}")
                
        except Exception as e:
            print(f"✗ Error with time estimation: {e}")

def main():
    """Main demo function."""
    print("🚀 MENTORIUM GAMIFIED LEARNING SYSTEM - COMPLETE DEMO")
    print("=" * 60)
    
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
    
    # Run comprehensive demo
    create_comprehensive_demo_data()
    time.sleep(1)
    
    demonstrate_analytics()
    demonstrate_individual_student()
    demonstrate_time_estimation()
    
    print("\n" + "=" * 60)
    print("🎉 GAMIFIED SYSTEM DEMO COMPLETE!")
    print("\n📱 FEATURE HIGHLIGHTS:")
    print("   ⏰ Adaptive countdown timers with personalized time estimates")
    print("   🏆 Comprehensive reward system with points and badges")
    print("   🔥 Streak tracking for habit formation")
    print("   📊 Real-time leaderboards for social proof")
    print("   📈 Analytics dashboard for progress tracking")
    print("   🎯 Micro-tips for personalized improvement")
    print("   🎮 Variable rewards for engagement")
    print("\n🚀 Ready to test in the web app!")
    print("   Start the mentorium-web app and navigate to Trials tab")
    print("   Try Lessons, Progress, and Ranks sections")
    print("=" * 60)

if __name__ == "__main__":
    main()
