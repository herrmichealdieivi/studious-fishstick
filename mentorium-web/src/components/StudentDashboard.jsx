import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Target, TrendingUp, Award, Calendar, Clock, Zap } from 'lucide-react';
import { fetchStudentStats } from '../backend';

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

  // Fetch student statistics via shared backend (Supabase or demo fallback)
  const loadStudentStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudentStats(studentId);
      setStudentStats(data);
    } catch (error) {
      console.error('Error fetching student stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudentStats();
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

  if (isLoading) {
    return (
      <div className={`rounded-lg p-4 border ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}>
        <div className="animate-pulse">
          <div className="h-6 rounded w-1/3 mb-4" style={{ backgroundColor: 'var(--m-border)' }} />
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg" style={{ backgroundColor: 'var(--m-border)' }} />
            ))}
          </div>
          <div className="h-20 rounded-lg" style={{ backgroundColor: 'var(--m-border)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Trophy className="w-5 h-5 mr-2" style={{ color: 'var(--m-gold)' }} />
          <h3 className="font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>My Progress</h3>
        </div>
        <button
          onClick={loadStudentStats}
          className="text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--m-textSecondary)' }}
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Points */}
        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--m-primaryAccent)', opacity: 0.9 }}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Star className="w-5 h-5" style={{ color: 'var(--m-cream)' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--m-cream)' }}>
              {language === 'ar' ? formatArabicNumbers(studentStats.total_points.toString()) : studentStats.total_points}
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--m-cream)', opacity: 0.8 }}>Total Points</div>
        </div>

        {/* Current Streak */}
        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--m-gold)' }}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Flame className="w-5 h-5" style={{ color: 'var(--m-cream)' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--m-cream)' }}>
              {language === 'ar' ? formatArabicNumbers(studentStats.current_streak.toString()) : studentStats.current_streak}
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--m-cream)', opacity: 0.8 }}>Day Streak</div>
        </div>

        {/* Lessons Completed */}
        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--m-secondaryAccent)' }}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Target className="w-5 h-5" style={{ color: 'var(--m-cream)' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--m-cream)' }}>
              {language === 'ar' ? formatArabicNumbers(studentStats.lessons_completed.toString()) : studentStats.lessons_completed}
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--m-cream)', opacity: 0.8 }}>Lessons Done</div>
        </div>

        {/* Average Efficiency */}
        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--m-secondary)' }}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Zap className="w-5 h-5" style={{ color: 'var(--m-cream)' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--m-cream)' }}>
              {studentStats.average_efficiency.toFixed(1)}x
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--m-cream)', opacity: 0.8 }}>Avg Speed</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-6">
        {/* Time Performance */}
        <div>
          <div className={`flex items-center justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span style={{ color: 'var(--m-textSecondary)' }}>On-Time Performance</span>
            <span className="font-medium" style={{ color: 'var(--m-textPrimary)' }}>
              {studentStats.lessons_completed > 0 
                ? Math.round((studentStats.lessons_under_time / studentStats.lessons_completed) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--m-border)' }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${studentStats.lessons_completed > 0 
                  ? (studentStats.lessons_under_time / studentStats.lessons_completed) * 100 
                  : 0}%`,
                backgroundColor: 'var(--m-success)',
              }}
            />
          </div>
        </div>

        {/* Streak Progress to Next Milestone */}
        <div>
          <div className={`flex items-center justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span style={{ color: 'var(--m-textSecondary)' }}>Next Streak Milestone</span>
            <span className="font-medium" style={{ color: 'var(--m-textPrimary)' }}>
              {studentStats.current_streak}/7 days
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--m-border)' }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min((studentStats.current_streak / 7) * 100, 100)}%`,
                backgroundColor: 'var(--m-gold)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      {studentStats.badges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--m-textPrimary)' }}>Recent Badges</h4>
          <div className="space-y-2">
            {studentStats.badges.slice(0, 3).map((badge, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded-lg"
                style={{ backgroundColor: 'var(--m-background)' }}
              >
                <Award className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: 'var(--m-primaryAccent)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--m-textPrimary)' }}>{badge.name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--m-textSecondary)' }}>{badge.description}</div>
                </div>
                <div className="text-xs ml-2" style={{ color: 'var(--m-textSecondary)' }}>
                  {formatDate(badge.earned_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--m-background)' }}>
        <div className="flex items-start">
          <Trophy className="w-4 h-4 mr-2 mt-1 flex-shrink-0" style={{ color: 'var(--m-primaryAccent)' }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--m-textPrimary)' }}>
              {studentStats.current_streak >= 7 
                ? "🔥 Amazing streak! You're on fire!" 
                : studentStats.current_streak >= 3 
                ? "🎯 Great progress! Keep it up!"
                : "📚 Start your learning journey today!"}
            </p>
            <p className="text-xs" style={{ color: 'var(--m-textSecondary)' }}>
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
        <div className={`mt-3 text-xs ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--m-textSecondary)' }}>
          Last activity: {formatDate(studentStats.last_activity)}
        </div>
      )}
    </div>
  );
}
