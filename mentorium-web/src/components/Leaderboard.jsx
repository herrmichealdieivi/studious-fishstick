import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Flame, Star, Users, TrendingUp } from 'lucide-react';
import { fetchLeaderboard } from '../backend';

export default function Leaderboard({ isRTL = false, language = 'en', period = 'all' }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const loadLeaderboard = async (periodValue = 'all') => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboard(periodValue);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(selectedPeriod);
  }, [selectedPeriod]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6" style={{ color: 'var(--m-gold)' }} />;
      case 2: return <Medal className="w-6 h-6" style={{ color: 'var(--m-secondary)' }} />;
      case 3: return <Award className="w-6 h-6" style={{ color: 'var(--m-gold)' }} />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold" style={{ color: 'var(--m-textSecondary)' }}>#{rank}</span>;
    }
  };

  const formatArabicNumbers = (str) => {
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      default: return 'All Time';
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg p-4 border ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}>
        <div className="animate-pulse">
          <div className="h-6 rounded w-1/3 mb-4" style={{ backgroundColor: 'var(--m-border)' }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full mr-3" style={{ backgroundColor: 'var(--m-border)' }} />
                <div className="h-4 rounded w-24" style={{ backgroundColor: 'var(--m-border)' }} />
              </div>
              <div className="h-4 rounded w-16" style={{ backgroundColor: 'var(--m-border)' }} />
            </div>
          ))}
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
          <h3 className="font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>Leaderboard</h3>
        </div>
        
        {/* Period Selector */}
        <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {['all', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className="px-3 py-1 text-xs font-medium rounded-lg transition-all"
              style={{
                backgroundColor: selectedPeriod === p ? 'var(--m-primaryAccent)' : 'var(--m-background)',
                color: selectedPeriod === p ? 'var(--m-cream)' : 'var(--m-textSecondary)',
              }}
            >
              {getPeriodLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboardData.map((entry, index) => (
          <div
            key={entry.student_id}
            className="flex items-center justify-between p-3 rounded-lg border"
            style={{
              backgroundColor: index < 3 ? 'var(--m-background)' : 'transparent',
              borderColor: index === 0 ? 'var(--m-gold)' : 'var(--m-border)',
              borderWidth: index === 0 ? '2px' : '1px',
            }}
          >
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Rank Icon */}
              <div className={`mr-3 ${isRTL ? 'ml-3 mr-0' : ''}`}>
                {getRankIcon(index + 1)}
              </div>
              
              {/* Student Info */}
              <div>
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="font-medium" style={{ color: 'var(--m-textPrimary)' }}>
                    {entry.student_id.replace('student_', 'Student ')}
                  </span>
                  {index < 3 && (
                    <div
                      className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full"
                      style={{ backgroundColor: 'var(--m-primaryAccent)', color: 'var(--m-cream)' }}
                    >
                      #{index + 1}
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className={`flex items-center gap-3 mt-1 text-xs ${isRTL ? 'flex-row-reverse' : ''}`} style={{ color: 'var(--m-textSecondary)' }}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Flame className="w-3 h-3 mr-1" style={{ color: 'var(--m-gold)' }} />
                    <span>{entry.current_streak} day streak</span>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Star className="w-3 h-3 mr-1" style={{ color: 'var(--m-gold)' }} />
                    <span>{entry.lessons_completed} lessons</span>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <TrendingUp className="w-3 h-3 mr-1" style={{ color: 'var(--m-success)' }} />
                    <span>{entry.average_efficiency.toFixed(1)}x efficiency</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Points */}
            <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
              <div className="text-lg font-bold" style={{ color: 'var(--m-primaryAccent)' }}>
                {language === 'ar' ? formatArabicNumbers(entry.total_points.toString()) : entry.total_points}
              </div>
              <div className="text-xs" style={{ color: 'var(--m-textSecondary)' }}>points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {leaderboardData.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--m-border)' }} />
          <p style={{ color: 'var(--m-textSecondary)' }}>No learners yet. Be the first!</p>
        </div>
      )}

      {/* Motivational Footer */}
      {leaderboardData.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--m-border)' }}>
          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: 'var(--m-textSecondary)' }}>
              🎯 Keep learning to climb the ranks!
            </p>
            <div className="flex justify-center gap-4 text-xs" style={{ color: 'var(--m-textSecondary)' }}>
              <span>🏆 Top performers get special badges</span>
              <span>🔥 Maintain streaks for bonus points</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
