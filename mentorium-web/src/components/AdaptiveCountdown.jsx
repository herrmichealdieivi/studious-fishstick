import React, { useState, useEffect, useCallback } from 'react';
import { Clock, TrendingUp, Zap, Target, Trophy, Flame, Star, Award, Lightbulb } from 'lucide-react';

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

  // Calculate rewards based on completion time
  const calculateRewards = useCallback((actualSeconds, estimatedSeconds) => {
    const actualMinutes = actualSeconds / 60;
    const estimatedMinutes = estimatedSeconds / 60;
    
    let points = 0;
    let bonusPoints = 0;
    let microTip = null;
    
    // Base points for completion
    points = 100;
    
    // Time-based rewards
    if (actualSeconds <= estimatedSeconds) {
      // Completed on time or early
      const timeBonus = Math.floor((estimatedSeconds - actualSeconds) / 60) * 10;
      bonusPoints += timeBonus;
      
      if (actualSeconds <= estimatedSeconds * 0.9) {
        // Completed within 10% margin - extra bonus
        bonusPoints += 50;
        microTip = "Excellent timing! You're mastering this skill efficiently.";
      }
    } else {
      // Over time - no bonus, provide tip
      const overTimeMinutes = Math.ceil((actualSeconds - estimatedSeconds) / 60);
      microTip = `To improve speed, try focusing on key concepts. You were ${overTimeMinutes} minute${overTimeMinutes > 1 ? 's' : ''} over target.`;
    }
    
    return { points, bonusPoints, microTip };
  }, []);

  // Complete lesson and calculate rewards
  const completeLesson = useCallback(async () => {
    if (!lessonStartTime || lessonCompleted) return;
    
    const actualTime = Date.now() - lessonStartTime;
    const estimatedTime = timeData.estimatedMinutes * 60 * 1000;
    
    const { points, bonusPoints, microTip } = calculateRewards(
      actualTime / 1000, 
      estimatedTime / 1000
    );
    
    try {
      // Send completion data to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/lesson-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          skill_id: skillId,
          subject_id: subjectId,
          actual_time_seconds: actualTime / 1000,
          estimated_time_seconds: estimatedTime / 1000,
          points_earned: points,
          bonus_points: bonusPoints
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setRewardData({
          points,
          bonusPoints,
          streak: result.streak || 0,
          newBadges: result.new_badges || [],
          microTip
        });
        
        // Show reward animation
        setShowRewardAnimation(true);
        setLessonCompleted(true);
        
        // Notify parent component
        if (onLessonComplete) {
          onLessonComplete({
            ...result,
            actualTime: actualTime / 1000,
            estimatedTime: estimatedTime / 1000
          });
        }
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      // Fallback - still show basic rewards
      setRewardData({ points, bonusPoints, streak: 0, newBadges: [], microTip });
      setShowRewardAnimation(true);
      setLessonCompleted(true);
    }
  }, [lessonStartTime, lessonCompleted, timeData.estimatedMinutes, studentId, skillId, subjectId, calculateRewards, onLessonComplete]);
  const fetchTimeEstimation = useCallback(async () => {
    if (!studentId || !skillId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/time-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          skill_id: skillId,
          subject_id: subjectId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTimeData({
          estimatedMinutes: data.estimated_minutes || 0,
          traditionalHours: data.traditional_hours || 0,
          confidence: data.confidence || 0,
          masteryLevel: data.mastery_level || 0,
          efficiency: data.efficiency || 1
        });
        
        // Notify parent component
        if (onTimeEstimate) {
          onTimeEstimate(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch time estimation:', error);
      // Fallback estimation
      setTimeData({
        estimatedMinutes: 15,
        traditionalHours: 2,
        confidence: 0.5,
        masteryLevel: 0.5,
        efficiency: 8
      });
    } finally {
      setIsLoading(false);
    }
  }, [studentId, skillId, subjectId, onTimeEstimate]);

  // Start countdown with lesson tracking
  const startCountdown = useCallback(() => {
    if (timeData.estimatedMinutes > 0) {
      setCountdown(timeData.estimatedMinutes * 60); // Convert to seconds
      setIsCountingDown(true);
      setLessonStartTime(Date.now());
      setLessonCompleted(false);
      setShowRewardAnimation(false);
    }
  }, [timeData.estimatedMinutes]);

  const stopCountdown = useCallback(() => {
    setIsCountingDown(false);
    setCountdown(null);
    // Auto-complete lesson when stopping
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
            // Auto-complete lesson when time runs out
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

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 8) return 'text-green-600';
    if (efficiency >= 5) return 'text-blue-600';
    if (efficiency >= 3) return 'text-yellow-600';
    return 'text-red-600';
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
        <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center animate-bounce">
          <div className="mb-4">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Lesson Complete!</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-lg font-semibold">{rewardData.points} Points Earned</span>
            </div>
            
            {rewardData.bonusPoints > 0 && (
              <div className="flex items-center justify-center text-green-600">
                <Zap className="w-5 h-5 mr-2" />
                <span className="font-semibold">+{rewardData.bonusPoints} Bonus Points!</span>
              </div>
            )}
            
            {rewardData.streak > 0 && (
              <div className="flex items-center justify-center text-orange-600">
                <Flame className="w-5 h-5 mr-2" />
                <span className="font-semibold">{rewardData.streak} Day Streak!</span>
              </div>
            )}
            
            {rewardData.newBadges.length > 0 && (
              <div className="flex items-center justify-center text-purple-600">
                <Award className="w-5 h-5 mr-2" />
                <span className="font-semibold">New Badge: {rewardData.newBadges[0]}</span>
              </div>
            )}
          </div>
          
          {rewardData.microTip && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <Lightbulb className="w-4 h-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-800 text-left">{rewardData.microTip}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowRewardAnimation(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-neutral-200">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <RewardAnimation />
      <div className={`bg-white rounded-lg p-4 border border-neutral-200 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Clock className="w-5 h-5 text-neutral-600 mr-2" />
            <h3 className="font-semibold text-neutral-900">Adaptive Timer</h3>
          </div>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Zap className={`w-4 h-4 mr-1 ${getEfficiencyColor(timeData.efficiency)}`} />
            <span className={`text-sm font-medium ${getEfficiencyColor(timeData.efficiency)}`}>
              {getEfficiencyLabel(timeData.efficiency)}
            </span>
          </div>
        </div>

      {/* Time Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {language === 'ar' ? formatArabicNumbers(timeData.estimatedMinutes.toString()) : timeData.estimatedMinutes}
            <span className="text-sm font-normal">min</span>
          </div>
          <div className="text-xs text-blue-700 mt-1">Mentorium Time</div>
        </div>
        <div className="text-center p-3 bg-neutral-50 rounded-lg">
          <div className="text-2xl font-bold text-neutral-600">
            {language === 'ar' ? formatArabicNumbers(timeData.traditionalHours.toString()) : timeData.traditionalHours}
            <span className="text-sm font-normal">hr</span>
          </div>
          <div className="text-xs text-neutral-600 mt-1">Traditional Time</div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="space-y-2 mb-4">
        <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-neutral-600">Efficiency</span>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-20 h-2 bg-neutral-200 rounded-full mr-2">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                style={{ width: `${Math.min((timeData.efficiency / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="font-medium text-neutral-900">{timeData.efficiency.toFixed(1)}x</span>
          </div>
        </div>
        
        <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-neutral-600">Mastery</span>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-20 h-2 bg-neutral-200 rounded-full mr-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                style={{ width: `${timeData.masteryLevel * 100}%` }}
              ></div>
            </div>
            <span className="font-medium text-neutral-900">{(timeData.masteryLevel * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      {countdown !== null && (
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg mb-4">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {language === 'ar' ? formatArabicNumbers(formatTime(countdown)) : formatTime(countdown)}
          </div>
          <div className="text-sm text-purple-700">
            {isCountingDown ? 'Time Remaining' : countdown === 0 ? 'Time\'s Up!' : 'Ready to Start'}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {!isCountingDown ? (
          <button
            onClick={startCountdown}
            className={`flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Target className="w-4 h-4 mr-2" />
            Start Learning
          </button>
        ) : (
          <button
            onClick={stopCountdown}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Stop Timer
          </button>
        )}
        
        <button
          onClick={fetchTimeEstimation}
          className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Confidence Indicator */}
      <div className={`mt-3 text-xs text-neutral-500 ${isRTL ? 'text-right' : 'text-left'}`}>
        Confidence: {(timeData.confidence * 100).toFixed(0)}% • Based on your learning patterns
      </div>
    </div>
    </>
  );
}
