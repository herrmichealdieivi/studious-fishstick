import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Target, TrendingUp, Award, Calendar, Clock, Zap } from 'lucide-react';

export default function StudentDashboard({ 
  studentId = 'demo_student_001',
  isRTL = false,
  language = 'en'
}) {
  const [studentStats, setStudentStats] = useState({
    total_points: 0,
    current_streak: 0,
    longest_streak: 0,
    lessons_completed: 0,
    lessons_under_time: 0,
    average_efficiency: 1.0,
    last_activity: null,
    badges: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student statistics
  const fetchStudentStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/student-stats/${studentId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setStudentStats(data);
      } else {
        console.error('Failed to fetch student stats');
        // Fallback demo data
        setStudentStats({
          total_points: 850,
          current_streak: 3,
          longest_streak: 7,
          lessons_completed: 12,
          lessons_under_time: 8,
          average_efficiency: 6.2,
          last_activity: new Date().toISOString(),
          badges: [
            {
              type: 'first_mastery',
              name: 'First Mastery',
              description: 'Completed your first lesson',
              earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              type: 'speed_demon',
              name: 'Speed Demon',
              description: 'Completed a lesson 20% faster than estimated',
              earned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
      // Fallback demo data
      setStudentStats({
        total_points: 850,
        current_streak: 3,
        longest_streak: 7,
        lessons_completed: 12,
        lessons_under_time: 8,
        average_efficiency: 6.2,
        badges: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentStats();
  }, [studentId]);

  const formatArabicNumbers = (str) => {
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStreakColor = (streak) => {
    if (streak >= 7) return 'text-purple-600 bg-purple-100';
    if (streak >= 3) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 8) return 'text-green-600';
    if (efficiency >= 5) return 'text-blue-600';
    if (efficiency >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-4 border border-neutral-200 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
          <div className="h-20 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-4 border border-neutral-200 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="font-semibold text-neutral-900">My Progress</h3>
        </div>
        <button
          onClick={fetchStudentStats}
          className="text-xs text-neutral-500 hover:text-neutral-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Points */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Star className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">
              {language === 'ar' ? formatArabicNumbers(studentStats.total_points.toString()) : studentStats.total_points}
            </span>
          </div>
          <div className="text-xs text-purple-700 mt-1">Total Points</div>
        </div>

        {/* Current Streak */}
        <div className={`rounded-lg p-3 ${getStreakColor(studentStats.current_streak)}`}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Flame className="w-5 h-5" />
            <span className="text-2xl font-bold">
              {language === 'ar' ? formatArabicNumbers(studentStats.current_streak.toString()) : studentStats.current_streak}
            </span>
          </div>
          <div className="text-xs mt-1">Day Streak</div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {language === 'ar' ? formatArabicNumbers(studentStats.lessons_completed.toString()) : studentStats.lessons_completed}
            </span>
          </div>
          <div className="text-xs text-blue-700 mt-1">Lessons Done</div>
        </div>

        {/* Average Efficiency */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Zap className="w-5 h-5 text-green-600" />
            <span className={`text-2xl font-bold ${getEfficiencyColor(studentStats.average_efficiency)}`}>
              {studentStats.average_efficiency.toFixed(1)}x
            </span>
          </div>
          <div className="text-xs text-green-700 mt-1">Avg Speed</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-6">
        {/* Time Performance */}
        <div>
          <div className={`flex items-center justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-neutral-600">On-Time Performance</span>
            <span className="font-medium text-neutral-900">
              {studentStats.lessons_completed > 0 
                ? Math.round((studentStats.lessons_under_time / studentStats.lessons_completed) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
              style={{ 
                width: `${studentStats.lessons_completed > 0 
                  ? (studentStats.lessons_under_time / studentStats.lessons_completed) * 100 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Streak Progress to Next Milestone */}
        <div>
          <div className={`flex items-center justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-neutral-600">Next Streak Milestone</span>
            <span className="font-medium text-neutral-900">
              {studentStats.current_streak}/7 days
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((studentStats.current_streak / 7) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      {studentStats.badges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">Recent Badges</h4>
          <div className="space-y-2">
            {studentStats.badges.slice(0, 3).map((badge, index) => (
              <div key={index} className="flex items-center p-2 bg-neutral-50 rounded-lg">
                <Award className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">{badge.name}</div>
                  <div className="text-xs text-neutral-600 truncate">{badge.description}</div>
                </div>
                <div className="text-xs text-neutral-500 ml-2">
                  {formatDate(badge.earned_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
        <div className="flex items-start">
          <Trophy className="w-4 h-4 text-purple-600 mr-2 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-purple-900 mb-1">
              {studentStats.current_streak >= 7 
                ? "🔥 Amazing streak! You're on fire!" 
                : studentStats.current_streak >= 3 
                ? "🎯 Great progress! Keep it up!"
                : "📚 Start your learning journey today!"}
            </p>
            <p className="text-xs text-purple-700">
              {studentStats.lessons_completed === 0 
                ? "Complete your first lesson to earn points and badges!"
                : studentStats.average_efficiency >= 5 
                ? `You're learning ${studentStats.average_efficiency.toFixed(1)}x faster than traditional methods!`
                : `Keep improving your speed to boost your efficiency rating!`}
            </p>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      {studentStats.last_activity && (
        <div className={`mt-3 text-xs text-neutral-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          Last activity: {formatDate(studentStats.last_activity)}
        </div>
      )}
    </div>
  );
}
