import React from 'react';

export default function Seal({ text, isRTL, language, setLanguage }) {
  return (
    <div className={`flex-1 overflow-y-auto pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Profile Header */}
      <div className="bg-white px-6 pt-8 pb-6 border-b-2 border-neutral-900">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-neutral-900 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-4xl">م</span>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">{text.userName}</h1>
          <p className="text-sm text-neutral-500 mt-1">{text.houseOfEuler}</p>
        </div>
      </div>
      
      {/* Language Settings */}
      <div className="px-6 mt-6">
        <h2 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          {text.languageSettings}
        </h2>
        <div className="bg-white rounded-sm border-2 border-neutral-200 overflow-hidden">
          <button
            onClick={() => setLanguage('en')}
            className={`w-full px-5 py-4 flex items-center justify-between border-b border-neutral-200 transition-colors ${
              language === 'en' ? 'bg-neutral-100' : 'bg-white'
            }`}
          >
            <span className="text-sm font-medium text-neutral-900">English</span>
            {language === 'en' && <div className="w-2 h-2 bg-neutral-900"></div>}
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
              language === 'ar' ? 'bg-neutral-100' : 'bg-white'
            }`}
          >
            <span className="text-sm font-medium text-neutral-900">العربية</span>
            {language === 'ar' && <div className="w-2 h-2 bg-neutral-900"></div>}
          </button>
        </div>
      </div>
      
      {/* Stats Preview */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-sm p-4 border border-neutral-200 text-center">
            <p className="text-2xl font-bold text-neutral-900 tabular-nums">11</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">{text.doorsOpened}</p>
          </div>
          <div className="bg-white rounded-sm p-4 border border-neutral-200 text-center">
            <p className="text-2xl font-bold text-neutral-900 tabular-nums">84%</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">{text.trialPerformance}</p>
          </div>
          <div className="bg-white rounded-sm p-4 border border-neutral-200 text-center">
            <p className="text-2xl font-bold text-neutral-900 tabular-nums">73%</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">{text.forum}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
