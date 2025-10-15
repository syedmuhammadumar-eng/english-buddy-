import { useState, useEffect, useCallback } from 'react';
import type { EnhancedVocabularyItem } from '../types';
import { generateEnhancedVocabulary, searchVocabularyWord } from '../services/geminiService';

const getTodayString = () => new Date().toISOString().split('T')[0];

interface DailyVocabulary {
  date: string;
  words: EnhancedVocabularyItem[];
}

const getInitialDailyVocab = (): DailyVocabulary | null => {
  try {
    const item = window.localStorage.getItem('dailyVocabulary');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error reading daily vocabulary from localStorage", error);
    return null;
  }
};

const getInitialMarkedWords = (): EnhancedVocabularyItem[] => {
    try {
        const item = window.localStorage.getItem('markedVocabulary');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Error reading marked words from localStorage", error);
        return [];
    }
};

export const useVocabulary = () => {
  const [dailyWords, setDailyWords] = useState<EnhancedVocabularyItem[]>([]);
  const [markedWords, setMarkedWords] = useState<EnhancedVocabularyItem[]>(getInitialMarkedWords);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search functionality
  const [searchResult, setSearchResult] = useState<EnhancedVocabularyItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSetVocabulary = async () => {
      setIsLoading(true);
      setError(null);
      const today = getTodayString();
      const storedVocab = getInitialDailyVocab();

      if (storedVocab && storedVocab.date === today) {
        setDailyWords(storedVocab.words);
        setIsLoading(false);
      } else {
        try {
          const newWords = await generateEnhancedVocabulary();
          setDailyWords(newWords);
          window.localStorage.setItem('dailyVocabulary', JSON.stringify({ date: today, words: newWords }));
        } catch (err) {
          console.error("Failed to fetch vocabulary:", err);
          setError("Could not load new vocabulary. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchAndSetVocabulary();
  }, []);
  
  useEffect(() => {
    try {
        window.localStorage.setItem('markedVocabulary', JSON.stringify(markedWords));
    } catch (error) {
        console.error("Error writing marked words to localStorage", error);
    }
  }, [markedWords]);

  const toggleMarkedWord = useCallback((wordToToggle: EnhancedVocabularyItem) => {
    setMarkedWords(prevMarked => {
        const isAlreadyMarked = prevMarked.some(w => w.word === wordToToggle.word);
        if (isAlreadyMarked) {
            return prevMarked.filter(w => w.word !== wordToToggle.word);
        } else {
            return [...prevMarked, wordToToggle];
        }
    });
  }, []);
  
  const isWordMarked = useCallback((word: EnhancedVocabularyItem) => {
    return markedWords.some(w => w.word === word.word);
  }, [markedWords]);

  const searchWord = useCallback(async (word: string) => {
    if (!word) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
        const result = await searchVocabularyWord(word);
        setSearchResult(result);
    } catch (err) {
        console.error("Failed to search for word:", err);
        setSearchError(`Could not find "${word}". Please try another word.`);
    } finally {
        setIsSearching(false);
    }
  }, []);

  return { 
    dailyWords, 
    markedWords, 
    toggleMarkedWord, 
    isWordMarked, 
    isLoading, 
    error,
    searchResult,
    isSearching,
    searchError,
    searchWord
  };
};