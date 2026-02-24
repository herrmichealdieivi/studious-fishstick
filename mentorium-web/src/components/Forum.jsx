import React from 'react';

export default function Forum({ text, isRTL, language }) {
  return (
    <div className={`flex-1 overflow-y-auto pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header - The Forum */}
      <div className="bg-white px-6 pt-8 pb-5 border-b border-neutral-200">
        <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{text.forum}</p>
            <h1 className="text-2xl font-semibold text-neutral-900 mt-1">{text.userName}</h1>
          </div>
          {/* Threshold Progress Ring */}
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="#e5e5e5" strokeWidth="3" fill="none"/>
              <circle
                cx="28" cy="28" r="24" stroke="#1a1a1a" strokeWidth="3" fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - 0.73)}`}
                strokeLinecap="square"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-neutral-900">{language === 'ar' ? '٧٣' : '73'}</span>
              <span className="text-[9px] text-neutral-500">%</span>
            </div>
          </div>
        </div>
        <p className={`text-sm text-neutral-600 ${isRTL ? 'text-right' : ''}`}>{text.standingIn}</p>
      </div>

      {/* Next Threshold */}
      <div className="px-6 mt-6">
        <h2 className={`text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
          {text.nextThreshold}
        </h2>
        <div className="bg-white rounded-sm p-6 border-2 border-neutral-900 shadow-sm">
          <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">{text.doorNum}</p>
              <h3 className="text-xl font-semibold text-neutral-900">{text.lessonTitle}</h3>
            </div>
            <div className={`w-2 h-2 bg-neutral-900 mt-2 ${isRTL ? 'mr-4' : 'ml-4'}`}></div>
          </div>
          <p className={`text-sm text-neutral-600 mb-5 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
            {text.lessonDesc}
          </p>
          <button className="w-full bg-neutral-900 text-white font-medium py-3.5 px-4 text-sm tracking-wide hover:bg-neutral-800 transition-colors">
            {text.enterDoor}
          </button>
        </div>
      </div>

      {/* Standing In */}
      <div className="px-6 mt-8">
        <h2 className={`text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
          {text.standingInLabel}
        </h2>
        
        <div className="bg-white rounded-sm p-5 mb-3 border-2 border-neutral-300">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Ε</span>
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-base font-semibold text-neutral-900">{text.houseOfEuler}</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">{text.mathematics}</p>
              </div>
            </div>
            <svg className={`w-5 h-5 text-neutral-400 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Doors Opened */}
        <div className="bg-white rounded-sm p-5 mb-3 border border-neutral-200">
          <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-semibold text-neutral-900">{text.doorsOpened}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{text.doorsCount}</p>
            </div>
            <p className="text-lg font-bold text-neutral-900 tabular-nums">{language === 'ar' ? '١١' : '11'}</p>
          </div>
          <div className={`w-full h-1.5 bg-neutral-200 overflow-hidden ${isRTL ? 'rtl' : ''}`}>
            <div className={`h-full bg-neutral-900 ${isRTL ? 'mr-auto' : ''}`} style={{ width: '46%' }}></div>
          </div>
        </div>

        {/* Trial Performance */}
        <div className="bg-white rounded-sm p-5 border border-neutral-200">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-semibold text-neutral-900">{text.trialPerformance}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{text.pastDays}</p>
            </div>
            <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
              <p className="text-lg font-bold text-neutral-900 tabular-nums">{language === 'ar' ? '٨٤' : '84'}%</p>
              <p className="text-xs text-green-600">{text.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="px-6 mt-8 pb-6">
        <div className="bg-neutral-900 rounded-sm p-6">
          <p className={`text-white text-base italic leading-relaxed ${isRTL ? 'text-right' : ''}`}>
            "{text.quote}"
          </p>
          <p className={`text-neutral-300 text-sm mt-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
            {text.quoteAuthor}
          </p>
        </div>
      </div>
    </div>
  );
}
