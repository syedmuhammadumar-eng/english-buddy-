import React from 'react';
import { Sidebar } from './components/Sidebar';
import { PracticeArea } from './components/PracticeArea';
import { VocabularySidebar } from './components/VocabularySidebar';
import { useProgress } from './hooks/useProgress';

const App: React.FC = () => {
  const { tenseStatuses, completeTense, activeTense, streak } = useProgress();

  return (
    <div className="bg-black text-white min-h-screen flex">
      <Sidebar 
        tenseStatuses={tenseStatuses} 
        activeTense={activeTense}
        streak={streak}
      />
      <main className="flex-grow p-8 overflow-y-auto">
        {activeTense ? (
          <PracticeArea 
            key={activeTense} // Force re-mount on tense change
            activeTense={activeTense} 
            onTenseComplete={completeTense} 
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-bold text-green-400">Congratulations!</h2>
            <p className="text-xl text-gray-300 mt-4">You've mastered all the tenses for today.</p>
            <p className="mt-2">Come back tomorrow to continue your streak!</p>
          </div>
        )}
      </main>
      <VocabularySidebar />
    </div>
  );
};

export default App;
