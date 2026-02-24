import React, { useState } from 'react';
import { useTranslations } from './hooks/useTranslations';
import Navigation from './components/Navigation';
import Forum from './components/Forum';
import Houses from './components/Houses';
import Trials from './components/Trials';
import Seal from './components/Seal';

export default function LearningAppHome() {
  const [activeTab, setActiveTab] = useState('forum');
  const [language, setLanguage] = useState('en');
  
  const isRTL = language === 'ar';
  const text = useTranslations(language);

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'forum': 
        return <Forum text={text} isRTL={isRTL} language={language} />;
      case 'houses': 
        return <Houses text={text} isRTL={isRTL} />;
      case 'trials': 
        return <Trials text={text} isRTL={isRTL} language={language} />;
      case 'seal': 
        return <Seal text={text} isRTL={isRTL} language={language} setLanguage={setLanguage} />;
      default: 
        return <Forum text={text} isRTL={isRTL} language={language} />;
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-neutral-50 max-w-md mx-auto ${isRTL ? 'rtl' : 'ltr'} font-sans`}>
      {/* Main Content Area */}
      {renderActiveTab()}
      
      {/* Bottom Navigation */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        text={text} 
        isRTL={isRTL} 
      />
    </div>
  );
}
