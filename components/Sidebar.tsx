import React from 'react';
import type { TenseStatus } from '../types';
import { TENSES } from '../constants';

interface SidebarProps {
  tenseStatuses: Record<string, TenseStatus>;
  activeTense?: string;
  streak: number;
}

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ tenseStatuses, activeTense, streak }) => {
  return (
    <aside className="w-80 bg-gray-900 text-white p-6 flex flex-col space-y-8 overflow-y-auto shrink-0">
      <div>
        <h1 className="text-3xl font-bold mb-2">ESL Buddy</h1>
        <div className="bg-yellow-500 text-black rounded-md px-3 py-1 text-center font-bold">
            Daily Streak: {streak} 🔥
        </div>
      </div>
      
      <nav className="space-y-2 flex-grow">
        <h2 className="text-xl font-semibold text-gray-400 mb-3 px-2">Tenses</h2>
        {TENSES.map(tense => {
          const status = tenseStatuses[tense] || 'locked';
          const isActive = tense === activeTense;
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';

          let classes = "w-full text-left px-4 py-2.5 rounded-md text-md font-medium transition-colors duration-200 flex items-center";

          if (isLocked) {
            classes += ' text-gray-500 cursor-not-allowed';
          } else if (isCompleted) {
            classes += ' bg-gray-800 text-gray-300';
          } else if (isActive) {
            classes += ' bg-white text-black';
          } else { // Unlocked but not active
            classes += ' text-gray-300 hover:bg-gray-800';
          }

          return (
            <button key={tense} className={classes} disabled={isLocked}>
              <span>{tense}</span>
              {isLocked && <LockIcon />}
              {isCompleted && <CheckIcon />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
