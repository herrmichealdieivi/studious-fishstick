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
      <div className="bg-white px-6 pt-8 pb-6 border-b border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900">{text.housesTitle}</h1>
        <p className={`text-sm text-neutral-600 mt-2 ${isRTL ? 'text-right' : ''}`}>
          {text.housesDescription}
        </p>
      </div>
      
      <div className="px-6 mt-6 space-y-4">
        {houses.map((house, index) => (
          <div key={index} className="bg-white rounded-sm p-5 border-2 border-neutral-300">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{house.letter}</span>
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-base font-semibold text-neutral-900">{house.name}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">{house.desc}</p>
                </div>
              </div>
              <svg className={`w-5 h-5 text-neutral-400 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
