import { useState, useEffect, useCallback } from 'react';
import { TENSES } from '../constants';
import type { TenseStatus } from '../types';

interface ProgressState {
  tenseStatuses: Record<string, TenseStatus>;
  lastCompletedDate: string | null;
  streak: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const getInitialState = (): ProgressState => {
  try {
    const item = window.localStorage.getItem('grammarAppProgress');
    if (item) {
      const state: ProgressState = JSON.parse(item);
      // Daily reset logic
      const today = getTodayString();
      if (state.lastCompletedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        // Reset streak if they missed a day
        if(state.lastCompletedDate !== yesterdayString) {
            state.streak = 0;
        }

        // Reset daily progress
        Object.keys(state.tenseStatuses).forEach(tense => {
            if (state.tenseStatuses[tense] === 'completed') {
                state.tenseStatuses[tense] = 'unlocked';
            }
        });
      }
      return state;
    }
  } catch (error) {
    console.error("Error reading progress from localStorage", error);
  }

  // Default state for a new user
  const initialStatuses: Record<string, TenseStatus> = {};
  TENSES.forEach((tense, index) => {
    initialStatuses[tense] = index === 0 ? 'unlocked' : 'locked';
  });
  return {
    tenseStatuses: initialStatuses,
    lastCompletedDate: null,
    streak: 0,
  };
};

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>(getInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem('grammarAppProgress', JSON.stringify(progress));
    } catch (error) {
      console.error("Error writing progress to localStorage", error);
    }
  }, [progress]);
  
  const completeTense = useCallback((tenseToComplete: string) => {
    setProgress(currentProgress => {
        const newStatuses = { ...currentProgress.tenseStatuses };
        newStatuses[tenseToComplete] = 'completed';

        const currentIndex = TENSES.indexOf(tenseToComplete);
        const nextTense = TENSES[currentIndex + 1];
        if (nextTense && newStatuses[nextTense] === 'locked') {
            newStatuses[nextTense] = 'unlocked';
        }
        
        const allCompleted = TENSES.every(t => newStatuses[t] === 'completed' || t === 'Mixed Tenses');
        let newStreak = currentProgress.streak;
        let newLastCompletedDate = currentProgress.lastCompletedDate;

        if (allCompleted) {
            const today = getTodayString();
            if (currentProgress.lastCompletedDate !== today) {
                newStreak = currentProgress.streak + 1;
                newLastCompletedDate = today;
            }
        }

        return {
            ...currentProgress,
            tenseStatuses: newStatuses,
            streak: newStreak,
            lastCompletedDate: newLastCompletedDate
        };
    });
  }, []);

  const activeTense = TENSES.find(tense => progress.tenseStatuses[tense] === 'unlocked');

  return { ...progress, completeTense, activeTense };
};
