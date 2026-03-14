import React, { useState, useEffect, useCallback } from 'react';
import { Clock, TrendingUp, Zap, Target, Trophy, Flame, Star, Award, Lightbulb } from 'lucide-react';
import { getTimeEstimate, completeLessonBackend } from '../backend';

export default function AdaptiveCountdown({ 
  studentId, 
  skillId, 
  subjectId,
  onTimeEstimate,
  onLessonComplete,
  isRTL = false,
  language = 'en'
}) {
  const [timeData, setTimeData] = useState({
    estimatedMinutes: 0,
    traditionalHours: 0,
    confidence: 0,
    masteryLevel: 0,
    efficiency: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [rewardData, setRewardData] = useState({
    points: 0,
    bonusPoints: 0,
    streak: 0,
    newBadges: [],
    microTip: null
  });
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  const calculateRewards = useCallback((actualSeconds, estimatedSeconds) => {
    let points = 100;
    let bonusPoints = 0;
    let microTip = null;
    
    if (actualSeconds <= estimatedSeconds) {
      const timeBonus = Math.floor((estimatedSeconds - actualSeconds) / 60) * 10;
      bonusPoints += timeBonus;
      
      if (actualSeconds <= estimatedSeconds * 0.9) {
        bonusPoints += 50;
        microTip = "Excellent timing! You're mastering this skill efficiently.";
      }
    } else {
      const overTimeMinutes = Math.ceil((actualSeconds - estimatedSeconds) / 60);
      microTip = `To improve speed, try focusing on key concepts. You were ${overTimeMinutes} minute${overTimeMinutes > 1 ? 's' : ''} over target.`;
    }
    
    return { points, bonusPoints, microTip };
  }, []);

  const completeLesson = useCallback(async () => {
    if (!lessonStartTime || lessonCompleted) return;
    
    const actualTime = Date.now() - lessonStartTime;
    const estimatedTime = timeData.estimatedMinutes * 60 * 1000;
    
    const { points, bonusPoints, microTip } = calculateRewards(
      actualTime / 1000, 
      estimatedTime / 1000
    );
    
    try {
      const result = await completeLessonBackend({
        student_id: studentId,
        skill_id: skillId,
        subject_id: subjectId,
        actual_time_seconds: actualTime / 1000,
        estimated_time_seconds: estimatedTime / 1000,
        points_earned: points,
        bonus_points: bonusPoints,
      });

      setRewardData({
        points,
        bonusPoints,
        streak: result.streak || 0,
        newBadges: result.new_badges || [],
        microTip,
      });

      setShowRewardAnimation(true);
      setLessonCompleted(true);

      if (onLessonComplete) {
        onLessonComplete({
          ...result,
          actualTime: actualTime / 1000,
          estimatedTime: estimatedTime / 1000,
        });
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      setRewardData({ points, bonusPoints, streak: 0, newBadges: [], microTip });
      setShowRewardAnimation(true);
      setLessonCompleted(true);
    }
  }, [lessonStartTime, lessonCompleted, timeData.estimatedMinutes, studentId, skillId, subjectId, calculateRewards, onLessonComplete]);

  const fetchTimeEstimation = useCallback(async () => {
    if (!studentId || !skillId) return;
    
    setIsLoading(true);
    try {
      const data = await getTimeEstimate(studentId, skillId, subjectId);
      setTimeData({
        estimatedMinutes: data.estimated_minutes || 0,
        traditionalHours: data.traditional_hours || 0,
        confidence: data.confidence || 0,
        masteryLevel: data.mastery_level || 0,
        efficiency: data.efficiency || 1,
      });

      if (onTimeEstimate) {
        onTimeEstimate(data);
      }
    } catch (error) {
      console.error('Failed to fetch time estimation:', error);
      setTimeData({
        estimatedMinutes: 15,
        traditionalHours: 2,
        confidence: 0.5,
        masteryLevel: 0.5,
        efficiency: 8,
      });
    } finally {
      setIsLoading(false);
    }
  }, [studentId, skillId, subjectId, onTimeEstimate]);

  const startCountdown = useCallback(() => {
    if (timeData.estimatedMinutes > 0) {
      setCountdown(timeData.estimatedMinutes * 60);
      setIsCountingDown(true);
      setLessonStartTime(Date.now());
      setLessonCompleted(false);
      setShowRewardAnimation(false);
    }
  }, [timeData.estimatedMinutes]);

  const stopCountdown = useCallback(() => {
    setIsCountingDown(false);
    setCountdown(null);
    if (lessonStartTime && !lessonCompleted) {
      completeLesson();
    }
  }, [lessonStartTime, lessonCompleted, completeLesson]);

  useEffect(() => {
    fetchTimeEstimation();
  }, [fetchTimeEstimation]);

  useEffect(() => {
    let interval;
    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsCountingDown(false);
            if (lessonStartTime && !lessonCompleted) {
              setTimeout(() => completeLesson(), 100);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdown, lessonStartTime, lessonCompleted, completeLesson]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatArabicNumbers = (str) => {
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const getEfficiencyLabel = (efficiency) => {
    if (efficiency >= 8) return 'Exceptional';
    if (efficiency >= 5) return 'Advanced';
    if (efficiency >= 3) return 'Moderate';
    return 'Developing';
  };

  // Reward Animation Component
  const RewardAnimation = () => {
    if (!showRewardAnimation) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-xl p-6 max-w-sm w-full text-center animate-bounce" style={{ backgroundColor: 'var(--m-card)' }}>
          <div className="mb-4">
            <Trophy className="w-16 h-16 mx-auto mb-2" style={{ color: 'var(--m-gold)' }} />
            <h2 className="text-2xl font-bold font-serif mb-2" style={{ color: 'var(--m-textPrimary)' }}>Lesson Complete!</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-center">
              <Star className="w-5 h-5 mr-2" style={{ color: 'var(--m-gold)' }} />
              <span className="text-lg font-semibold" style={{ color: 'var(--m-textPrimary)' }}>{rewardData.points} Points Earned</span>
            </div>
            
            {rewardData.bonusPoints > 0 && (
              <div className="flex items-center justify-center" style={{ color: 'var(--m-success)' }}>
                <Zap className="w-5 h-5 mr-2" />
                <span className="font-semibold">+{rewardData.bonusPoints} Bonus Points!</span>
              </div>
            )}
            
            {rewardData.streak > 0 && (
              <div className="flex items-center justify-center" style={{ color: 'var(--m-gold)' }}>
                <Flame className="w-5 h-5 mr-2" />
                <span className="font-semibold">{rewardData.streak} Day Streak!</span>
              </div>
            )}
            
            {rewardData.newBadges.length > 0 && (
              <div className="flex items-center justify-center" style={{ color: 'var(--m-primaryAccent)' }}>
                <Award className="w-5 h-5 mr-2" />
                <span className="font-semibold">New Badge: {rewardData.newBadges[0]}</span>
              </div>
            )}
          </div>
          
          {rewardData.microTip && (
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'var(--m-background)' }}>
              <div className="flex items-start">
                <Lightbulb className="w-4 h-4 mr-2 mt-1 flex-shrink-0" style={{ color: 'var(--m-primaryAccent)' }} />
                <p className="text-sm text-left" style={{ color: 'var(--m-textSecondary)' }}>{rewardData.microTip}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowRewardAnimation(false)}
            className="w-full px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--m-primaryAccent)', color: 'var(--m-cream)' }}
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}>
        <div className="animate-pulse">
          <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--m-border)' }} />
          <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--m-border)' }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <RewardAnimation />
      <div className={`rounded-lg p-4 border ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Clock className="w-5 h-5 mr-2" style={{ color: 'var(--m-textSecondary)' }} />
            <h3 className="font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>Adaptive Timer</h3>
          </div>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Zap className="w-4 h-4 mr-1" style={{ color: 'var(--m-success)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--m-success)' }}>
              {getEfficiencyLabel(timeData.efficiency)}
            </span>
          </div>
        </div>

        {/* Time Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--m-primaryAccent)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--m-cream)' }}>
              {language === 'ar' ? formatArabicNumbers(timeData.estimatedMinutes.toString()) : timeData.estimatedMinutes}
              <span className="text-sm font-normal"> min</span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--m-cream)', opacity: 0.8 }}>Mentorium Time</div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--m-background)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--m-textSecondary)' }}>
              {language === 'ar' ? formatArabicNumbers(timeData.traditionalHours.toString()) : timeData.traditionalHours}
              <span className="text-sm font-normal"> hr</span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--m-textSecondary)' }}>Traditional Time</div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="space-y-2 mb-4">
          <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span style={{ color: 'var(--m-textSecondary)' }}>Efficiency</span>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-20 h-2 rounded-full mr-2" style={{ backgroundColor: 'var(--m-border)' }}>
                <div 
                  className="h-full rounded-full"
                  style={{ width: `${Math.min((timeData.efficiency / 10) * 100, 100)}%`, backgroundColor: 'var(--m-success)' }}
                />
              </div>
              <span className="font-medium" style={{ color: 'var(--m-textPrimary)' }}>{timeData.efficiency.toFixed(1)}x</span>
            </div>
          </div>
          
          <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span style={{ color: 'var(--m-textSecondary)' }}>Mastery</span>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-20 h-2 rounded-full mr-2" style={{ backgroundColor: 'var(--m-border)' }}>
                <div 
                  className="h-full rounded-full"
                  style={{ width: `${timeData.masteryLevel * 100}%`, backgroundColor: 'var(--m-primaryAccent)' }}
                />
              </div>
              <span className="font-medium" style={{ color: 'var(--m-textPrimary)' }}>{(timeData.masteryLevel * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        {countdown !== null && (
          <div className="text-center p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--m-background)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--m-primaryAccent)' }}>
              {language === 'ar' ? formatArabicNumbers(formatTime(countdown)) : formatTime(countdown)}
            </div>
            <div className="text-sm" style={{ color: 'var(--m-textSecondary)' }}>
              {isCountingDown ? 'Time Remaining' : countdown === 0 ? "Time's Up!" : 'Ready to Start'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {!isCountingDown ? (
            <button
              onClick={startCountdown}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 flex items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{ backgroundColor: 'var(--m-primaryAccent)', color: 'var(--m-cream)' }}
            >
              <Target className="w-4 h-4 mr-2" />
              Start Learning
            </button>
          ) : (
            <button
              onClick={stopCountdown}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--m-error)', color: 'var(--m-cream)' }}
            >
              Stop Timer
            </button>
          )}
          
          <button
            onClick={fetchTimeEstimation}
            className="px-4 py-2 border rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--m-border)', color: 'var(--m-textSecondary)' }}
          >
            Refresh
          </button>
        </div>

        {/* Confidence Indicator */}
        <div className={`mt-3 text-xs ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--m-textSecondary)' }}>
          Confidence: {(timeData.confidence * 100).toFixed(0)}% • Based on your learning patterns
        </div>
      </div>
    </>
  );
}
