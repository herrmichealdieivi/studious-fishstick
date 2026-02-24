import React, { useState } from 'react';
import AdaptiveCountdown from './AdaptiveCountdown';
import StudentDashboard from './StudentDashboard';
import Leaderboard from './Leaderboard';

export default function Trials({ text, isRTL, language }) {
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [activeTab, setActiveTab] = useState('trials'); // 'trials', 'dashboard', 'leaderboard'
  
  // Mock student and skill data - in real app, this would come from auth/context
  const studentData = {
    studentId: "demo_student_001",
    skillId: "math_algebra_basics",
    subjectId: "math"
  };

  const trials = [
    { 
      id: 'algebra_basics',
      title: text.trial1, 
      progress: 75, 
      status: text.trialStatus,
      skillId: 'math_algebra_basics'
    },
    { 
      id: 'geometry_fundamentals',
      title: text.trial2, 
      progress: 42, 
      status: text.trialStatus,
      skillId: 'math_geometry_fundamentals'
    },
    { 
      id: 'advanced_calculus',
      title: text.trial3, 
      progress: 18, 
      status: text.trialStatus,
      skillId: 'math_advanced_calculus'
    }
  ];

  const handleTrialClick = (trial) => {
    setSelectedTrial(trial);
    setShowTimer(true);
  };

  const handleTimeEstimate = (estimateData) => {
    console.log('Time estimate received:', estimateData);
    // You can use this data to update UI or send analytics
  };

  const handleLessonComplete = (completionData) => {
    console.log('Lesson completed:', completionData);
    // Refresh dashboard data when lesson is completed
    // This could trigger a refetch of student stats
  };

  return (
    <div className={`flex-1 overflow-y-auto pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="bg-white px-6 pt-8 pb-6 border-b border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900">{text.trialsTitle}</h1>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white px-6 py-3 border-b border-neutral-200">
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {[
            { id: 'trials', label: 'Lessons', icon: '📚' },
            { id: 'dashboard', label: 'Progress', icon: '📊' },
            { id: 'leaderboard', label: 'Ranks', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              } ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="px-6 mt-6">
        {/* Trials Tab */}
        {activeTab === 'trials' && (
          <div className="space-y-4">
            {showTimer && selectedTrial && (
              <div className="mb-6">
                <AdaptiveCountdown
                  studentId={studentData.studentId}
                  skillId={selectedTrial.skillId}
                  subjectId={studentData.subjectId}
                  onTimeEstimate={handleTimeEstimate}
                  onLessonComplete={handleLessonComplete}
                  isRTL={isRTL}
                  language={language}
                />
              </div>
            )}
            
            {trials.map((trial, index) => (
              <div 
                key={trial.id} 
                className="bg-white rounded-sm p-5 border border-neutral-200 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => handleTrialClick(trial)}
              >
            <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-base font-semibold text-neutral-900">{trial.title}</h3>
              <span className="text-xs text-neutral-500 uppercase tracking-wide">{trial.status}</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1 mr-4">
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-900 rounded-full" 
                    style={{ width: `${trial.progress}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                {language === 'ar' ? trial.progress.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : trial.progress}%
              </span>
            </div>
          </div>
        ))}
          </div>
        )}
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <StudentDashboard
            studentId={studentData.studentId}
            isRTL={isRTL}
            language={language}
          />
        )}
        
        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <Leaderboard
            isRTL={isRTL}
            language={language}
          />
        )}
      </div>
    </div>
  );
}
