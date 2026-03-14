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
  };

  const handleLessonComplete = (completionData) => {
    console.log('Lesson completed:', completionData);
  };

  const tabs = [
    { id: 'trials', label: 'Lessons', icon: '📚' },
    { id: 'dashboard', label: 'Progress', icon: '📊' },
    { id: 'leaderboard', label: 'Ranks', icon: '🏆' }
  ];

  return (
    <div className={`flex-1 overflow-y-auto pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div
        className="px-6 pt-8 pb-6 border-b"
        style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
      >
        <h1 className="text-2xl font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>
          {text.trialsTitle}
        </h1>
      </div>
      
      {/* Tab Navigation */}
      <div className="px-6 py-3 border-b" style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}>
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--m-primaryAccent)' : 'var(--m-background)',
                color: activeTab === tab.id ? 'var(--m-cream)' : 'var(--m-textSecondary)',
              }}
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
            
            {trials.map((trial) => (
              <div 
                key={trial.id} 
                className="rounded-lg p-5 border transition-all hover:shadow-md cursor-pointer"
                style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
                onClick={() => handleTrialClick(trial)}
              >
                <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-base font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>
                    {trial.title}
                  </h3>
                  <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--m-textSecondary)' }}>
                    {trial.status}
                  </span>
                </div>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1 mr-4">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--m-border)' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${trial.progress}%`, backgroundColor: 'var(--m-primaryAccent)' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--m-textPrimary)' }}>
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
