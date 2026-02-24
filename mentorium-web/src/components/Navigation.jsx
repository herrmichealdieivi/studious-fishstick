import React from 'react';
import { ForumIcon, GateIcon, ScaleIcon, SealIcon } from './Icons';

export default function Navigation({ activeTab, setActiveTab, text, isRTL }) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-200">
      <div className="grid grid-cols-4">
        <button
          onClick={() => setActiveTab('forum')}
          className={`flex flex-col items-center py-3 px-2 transition-colors ${
            activeTab === 'forum' 
              ? 'text-neutral-900 bg-neutral-100' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <ForumIcon />
          <span className="text-xs mt-1 font-medium">{text.navForum}</span>
        </button>
        
        <button
          onClick={() => setActiveTab('houses')}
          className={`flex flex-col items-center py-3 px-2 transition-colors ${
            activeTab === 'houses' 
              ? 'text-neutral-900 bg-neutral-100' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <GateIcon />
          <span className="text-xs mt-1 font-medium">{text.navHouses}</span>
        </button>
        
        <button
          onClick={() => setActiveTab('trials')}
          className={`flex flex-col items-center py-3 px-2 transition-colors ${
            activeTab === 'trials' 
              ? 'text-neutral-900 bg-neutral-100' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <ScaleIcon />
          <span className="text-xs mt-1 font-medium">{text.navTrials}</span>
        </button>
        
        <button
          onClick={() => setActiveTab('seal')}
          className={`flex flex-col items-center py-3 px-2 transition-colors ${
            activeTab === 'seal' 
              ? 'text-neutral-900 bg-neutral-100' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <SealIcon />
          <span className="text-xs mt-1 font-medium">{text.navSeal}</span>
        </button>
      </div>
    </div>
  );
}
