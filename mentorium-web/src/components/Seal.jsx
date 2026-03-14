import React from 'react';

export default function Seal({ text, isRTL, language, setLanguage, theme, toggleTheme }) {
  return (
    <div className={`flex-1 overflow-y-auto pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Profile Header */}
      <div
        className="px-6 pt-8 pb-6 border-b-2"
        style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-primaryAccent)' }}
      >
        <div className="flex flex-col items-center">
          <div
            className="w-24 h-24 flex items-center justify-center rounded-xl mb-4"
            style={{ backgroundColor: 'var(--m-primaryAccent)' }}
          >
            <span className="font-bold text-4xl" style={{ color: 'var(--m-cream)' }}>م</span>
          </div>
          <h1 className="text-2xl font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>
            {text.userName}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--m-textSecondary)' }}>
            {text.houseOfEuler}
          </p>
        </div>
      </div>
      
      {/* Theme Toggle */}
      <div className="px-6 mt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--m-textSecondary)' }}>
          Theme
        </h2>
        <div className="rounded-lg border-2 overflow-hidden" style={{ borderColor: 'var(--m-border)' }}>
          <button
            onClick={toggleTheme}
            className="w-full px-5 py-4 flex items-center justify-between transition-colors"
            style={{ backgroundColor: 'var(--m-card)', color: 'var(--m-textPrimary)' }}
          >
            <span className="text-sm font-medium">
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--m-primaryAccent)', color: 'var(--m-cream)' }}>
              Tap to switch
            </span>
          </button>
        </div>
      </div>

      {/* Language Settings */}
      <div className="px-6 mt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--m-textSecondary)' }}>
          {text.languageSettings}
        </h2>
        <div className="rounded-lg border-2 overflow-hidden" style={{ borderColor: 'var(--m-border)' }}>
          <button
            onClick={() => setLanguage('en')}
            className="w-full px-5 py-4 flex items-center justify-between border-b transition-colors"
            style={{
              backgroundColor: language === 'en' ? 'var(--m-primaryAccent)' : 'var(--m-card)',
              color: language === 'en' ? 'var(--m-cream)' : 'var(--m-textPrimary)',
              borderColor: 'var(--m-border)',
            }}
          >
            <span className="text-sm font-medium">English</span>
            {language === 'en' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--m-cream)' }} />}
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className="w-full px-5 py-4 flex items-center justify-between transition-colors"
            style={{
              backgroundColor: language === 'ar' ? 'var(--m-primaryAccent)' : 'var(--m-card)',
              color: language === 'ar' ? 'var(--m-cream)' : 'var(--m-textPrimary)',
            }}
          >
            <span className="text-sm font-medium">العربية</span>
            {language === 'ar' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--m-cream)' }} />}
          </button>
        </div>
      </div>
      
      {/* Stats Preview */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '11', label: text.doorsOpened },
            { value: '84%', label: text.trialPerformance },
            { value: '73%', label: text.forum },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-lg p-4 border text-center"
              style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
            >
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--m-primaryAccent)' }}>{stat.value}</p>
              <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: 'var(--m-textSecondary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
