import React from 'react';
import { ForumIcon, GateIcon, ScaleIcon, SealIcon } from './Icons';

export default function Navigation({ activeTab, setActiveTab, text, isRTL }) {
  const tabs = [
    { key: 'forum',  icon: <ForumIcon />, label: text.navForum },
    { key: 'houses', icon: <GateIcon />,  label: text.navHouses },
    { key: 'trials', icon: <ScaleIcon />, label: text.navTrials },
    { key: 'seal',   icon: <SealIcon />,  label: text.navSeal },
  ];

  return (
    <div
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md border-t"
      style={{
        backgroundColor: 'var(--m-card)',
        borderColor: 'var(--m-border)',
      }}
    >
      <div className="grid grid-cols-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex flex-col items-center py-3 px-2 transition-all duration-200"
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--m-primaryAccent)' : 'transparent',
              color: activeTab === tab.key ? 'var(--m-cream)' : 'var(--m-textSecondary)',
              borderRadius: activeTab === tab.key ? '12px' : '0',
            }}
          >
            {tab.icon}
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
