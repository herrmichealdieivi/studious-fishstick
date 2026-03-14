import React from 'react';

export default function Forum({ text, isRTL, language }) {
  return (
    <div className={`flex-1 overflow-y-auto pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header - The Forum */}
      <div
        className="px-6 pt-8 pb-5 border-b"
        style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
      >
        <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--m-textSecondary)' }}
            >
              {text.forum}
            </p>
            <h1
              className="text-2xl font-semibold mt-1 font-serif"
              style={{ color: 'var(--m-textPrimary)' }}
            >
              {text.userName}
            </h1>
          </div>
          {/* Threshold Progress Ring */}
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="var(--m-border)" strokeWidth="3" fill="none"/>
              <circle
                cx="28" cy="28" r="24" stroke="var(--m-primaryAccent)" strokeWidth="3" fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - 0.73)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold" style={{ color: 'var(--m-textPrimary)' }}>
                {language === 'ar' ? '٧٣' : '73'}
              </span>
              <span className="text-[9px]" style={{ color: 'var(--m-textSecondary)' }}>%</span>
            </div>
          </div>
        </div>
        <p className={`text-sm ${isRTL ? 'text-right' : ''}`} style={{ color: 'var(--m-textSecondary)' }}>
          {text.standingIn}
        </p>
      </div>

      {/* Next Threshold */}
      <div className="px-6 mt-6">
        <h2
          className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}
          style={{ color: 'var(--m-textSecondary)' }}
        >
          {text.nextThreshold}
        </h2>
        <div
          className="rounded-lg p-6 border-2 shadow-sm"
          style={{
            backgroundColor: 'var(--m-card)',
            borderColor: 'var(--m-primaryAccent)',
          }}
        >
          <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <p className="text-xs mb-1 uppercase tracking-wide" style={{ color: 'var(--m-textSecondary)' }}>
                {text.doorNum}
              </p>
              <h3 className="text-xl font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>
                {text.lessonTitle}
              </h3>
            </div>
            <div
              className={`w-2 h-2 rounded-full mt-2 ${isRTL ? 'mr-4' : 'ml-4'}`}
              style={{ backgroundColor: 'var(--m-primaryAccent)' }}
            />
          </div>
          <p className={`text-sm mb-5 leading-relaxed ${isRTL ? 'text-right' : ''}`} style={{ color: 'var(--m-textSecondary)' }}>
            {text.lessonDesc}
          </p>
          <button
            className="w-full font-medium py-3.5 px-4 text-sm tracking-wide rounded-lg transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--m-primaryAccent)',
              color: 'var(--m-cream)',
            }}
          >
            {text.enterDoor}
          </button>
        </div>
      </div>

      {/* Standing In */}
      <div className="px-6 mt-8">
        <h2
          className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}
          style={{ color: 'var(--m-textSecondary)' }}
        >
          {text.standingInLabel}
        </h2>
        
        <div
          className="rounded-lg p-5 mb-3 border-2"
          style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-primaryAccent)' }}
        >
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--m-primaryAccent)' }}
              >
                <span className="font-bold text-lg" style={{ color: 'var(--m-cream)' }}>Ε</span>
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-base font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>
                  {text.houseOfEuler}
                </p>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--m-textSecondary)' }}>
                  {text.mathematics}
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`}
              style={{ color: 'var(--m-textSecondary)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Doors Opened */}
        <div
          className="rounded-lg p-5 mb-3 border"
          style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
        >
          <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-semibold" style={{ color: 'var(--m-textPrimary)' }}>
                {text.doorsOpened}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--m-textSecondary)' }}>
                {text.doorsCount}
              </p>
            </div>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--m-textPrimary)' }}>
              {language === 'ar' ? '١١' : '11'}
            </p>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden ${isRTL ? 'rtl' : ''}`}
            style={{ backgroundColor: 'var(--m-border)' }}
          >
            <div
              className={`h-full rounded-full ${isRTL ? 'mr-auto' : ''}`}
              style={{ width: '46%', backgroundColor: 'var(--m-primaryAccent)' }}
            />
          </div>
        </div>

        {/* Trial Performance */}
        <div
          className="rounded-lg p-5 border"
          style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
        >
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-semibold" style={{ color: 'var(--m-textPrimary)' }}>
                {text.trialPerformance}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--m-textSecondary)' }}>
                {text.pastDays}
              </p>
            </div>
            <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
              <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--m-textPrimary)' }}>
                {language === 'ar' ? '٨٤' : '84'}%
              </p>
              <p className="text-xs" style={{ color: 'var(--m-success)' }}>{text.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="px-6 mt-8 pb-6">
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--m-primaryAccent)' }}>
          <p className={`text-base italic leading-relaxed ${isRTL ? 'text-right' : ''}`} style={{ color: 'var(--m-cream)' }}>
            "{text.quote}"
          </p>
          <p
            className={`text-sm mt-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}
            style={{ color: 'var(--m-cream)', opacity: 0.7 }}
          >
            {text.quoteAuthor}
          </p>
        </div>
      </div>
    </div>
  );
}
