import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Flame, Star, Users, TrendingUp } from 'lucide-react';

export default function Leaderboard({ isRTL = false, language = 'en', period = 'all' }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Fetch leaderboard data
  const fetchLeaderboard = async (period = 'all') => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/leaderboard?limit=10&period=${period}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      } else {
        console.error('Failed to fetch leaderboard data');
        // Fallback demo data
        setLeaderboardData([
          {
            student_id: 'student_001',
            total_points: 2450,
            current_streak: 12,
            lessons_completed: 28,
            average_efficiency: 8.2
          },
          {
            student_id: 'student_002',
            total_points: 1890,
            current_streak: 8,
            lessons_completed: 22,
            average_efficiency: 6.5
          },
          {
            student_id: 'student_003',
            total_points: 1650,
            current_streak: 5,
            lessons_completed: 19,
            average_efficiency: 7.1
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Fallback demo data
      setLeaderboardData([
        {
          student_id: 'student_001',
          total_points: 2450,
          current_streak: 12,
          lessons_completed: 28,
          average_efficiency: 8.2
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedPeriod);
  }, [selectedPeriod]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-neutral-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const formatArabicNumbers = (str) => {
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      default:
        return 'All Time';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-4 border border-neutral-200 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-neutral-200 rounded-full mr-3"></div>
                <div className="h-4 bg-neutral-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-neutral-200 rounded w-16"></div>
            </div>
          ))}
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
          <h3 className="font-semibold text-neutral-900">Leaderboard</h3>
        </div>
        
        {/* Period Selector */}
        <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {['all', 'weekly', 'monthly'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboardData.map((entry, index) => (
          <div
            key={entry.student_id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
              index === 1 ? 'bg-gradient-to-r from-gray-50 to-neutral-50 border border-gray-200' :
              index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200' :
              'bg-neutral-50'
            }`}
          >
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Rank Icon */}
              <div className={`mr-3 ${isRTL ? 'ml-3 mr-0' : ''}`}>
                {getRankIcon(index + 1)}
              </div>
              
              {/* Student Info */}
              <div>
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="font-medium text-neutral-900">
                    {entry.student_id.replace('student_', 'Student ')}
                  </span>
                  {index < 3 && (
                    <div className={`ml-2 px-2 py-1 text-xs font-bold rounded ${getRankBadgeColor(index + 1)}`}>
                      #{index + 1}
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className={`flex items-center gap-3 mt-1 text-xs text-neutral-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Flame className="w-3 h-3 mr-1 text-orange-500" />
                    <span>{entry.current_streak} day streak</span>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    <span>{entry.lessons_completed} lessons</span>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    <span>{entry.average_efficiency.toFixed(1)}x efficiency</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Points */}
            <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
              <div className="text-lg font-bold text-purple-600">
                {language === 'ar' ? formatArabicNumbers(entry.total_points.toString()) : entry.total_points}
              </div>
              <div className="text-xs text-neutral-500">points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {leaderboardData.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <p className="text-neutral-500">No learners yet. Be the first!</p>
        </div>
      )}

      {/* Motivational Footer */}
      {leaderboardData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-2">
              🎯 Keep learning to climb the ranks!
            </p>
            <div className="flex justify-center gap-4 text-xs text-neutral-500">
              <span>🏆 Top performers get special badges</span>
              <span>🔥 Maintain streaks for bonus points</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
