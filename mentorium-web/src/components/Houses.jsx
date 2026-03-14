import React from 'react';

export default function Houses({ text, isRTL }) {
  const houses = [
    { name: text.eulerHouse, letter: 'Ε', desc: text.mathematics },
    { name: text.gaussHouse, letter: 'G', desc: 'Number Theory' },
    { name: text.noetherHouse, letter: 'N', desc: 'Abstract Algebra' },
    { name: text.riemannHouse, letter: 'R', desc: 'Geometry & Analysis' }
  ];

  return (
    <div className={`flex-1 overflow-y-auto pb-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div
        className="px-6 pt-8 pb-6 border-b"
        style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
      >
        <h1 className="text-2xl font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>
          {text.housesTitle}
        </h1>
        <p className={`text-sm mt-2 ${isRTL ? 'text-right' : ''}`} style={{ color: 'var(--m-textSecondary)' }}>
          {text.housesDescription}
        </p>
      </div>
      
      <div className="px-6 mt-6 space-y-4">
        {houses.map((house, index) => (
          <div
            key={index}
            className="rounded-lg p-5 border-2 transition-all hover:shadow-md cursor-pointer"
            style={{ backgroundColor: 'var(--m-card)', borderColor: 'var(--m-border)' }}
          >
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--m-primaryAccent)' }}
                >
                  <span className="font-bold text-lg" style={{ color: 'var(--m-cream)' }}>{house.letter}</span>
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-base font-semibold font-serif" style={{ color: 'var(--m-textPrimary)' }}>
                    {house.name}
                  </p>
                  <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--m-textSecondary)' }}>
                    {house.desc}
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
        ))}
      </div>
    </div>
  );
}
