import React, { useState } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import type { EnhancedVocabularyItem } from '../types';
import { Loader } from './ui/Loader';
import { Button } from './ui/Button';

const StarIcon: React.FC<{ isFilled: boolean; onClick: () => void }> = ({ isFilled, onClick }) => (
  <button onClick={onClick} className="absolute top-3 right-3 text-yellow-400 hover:text-yellow-300 transition-colors focus:outline-none">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.951a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.951c.3.921-.755 1.688-1.54 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.951a1 1 0 00-.364-1.118L2.05 9.378c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
  </button>
);

const VocabularyCard: React.FC<{ item: EnhancedVocabularyItem; isMarked: boolean; onToggleMark: () => void; }> = ({ item, isMarked, onToggleMark }) => (
    <div className="bg-gray-800 p-4 rounded-lg relative border border-gray-700">
        <StarIcon isFilled={isMarked} onClick={onToggleMark} />
        <h3 className="text-xl font-bold text-white pr-8">{item.word}</h3>
        <p className="text-xs text-gray-400 italic mb-2">{item.source}</p>
        <p className="text-gray-300 mb-3">"{item.example}"</p>
        <p className="text-yellow-400 font-semibold mb-3">Urdu: {item.urduTranslation}</p>
        {item.isVerb && (
            <div className="flex space-x-4 text-sm bg-gray-900/50 p-2 rounded-md">
                <div><span className="font-bold text-gray-400">V1:</span> {item.v1}</div>
                <div><span className="font-bold text-gray-400">V2:</span> {item.v2}</div>
                <div><span className="font-bold text-gray-400">V3:</span> {item.v3}</div>
            </div>
        )}
    </div>
);

const SearchWidget: React.FC = () => {
    const { searchResult, isSearching, searchError, searchWord, isWordMarked, toggleMarkedWord } = useVocabulary();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchWord(searchTerm.trim());
    }

    return (
        <div className="my-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a word..."
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <Button type="submit" variant="secondary" disabled={isSearching || !searchTerm.trim()}>
                    {isSearching ? <Loader/> : 'Search'}
                </Button>
            </form>
            <div className="mt-4">
                {searchError && <p className="text-red-400 text-sm">{searchError}</p>}
                {searchResult && !isSearching && (
                    <VocabularyCard
                        item={searchResult}
                        isMarked={isWordMarked(searchResult)}
                        onToggleMark={() => toggleMarkedWord(searchResult)}
                    />
                )}
            </div>
        </div>
    );
};


export const VocabularySidebar: React.FC = () => {
    const { dailyWords, markedWords, toggleMarkedWord, isWordMarked, isLoading, error } = useVocabulary();

    return (
        <aside className="w-96 bg-gray-900 text-white p-6 flex-col space-y-6 overflow-y-auto shrink-0 hidden lg:flex border-l border-gray-700">
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <Loader />
                </div>
            ) : error ? (
                <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>
            ) : (
                <>
                    <div>
                        <h2 className="text-2xl font-bold mb-0">Daily Vocabulary</h2>
                        <SearchWidget />
                        <div className="space-y-4">
                            {dailyWords.map((item) => (
                                <VocabularyCard 
                                    key={item.word} 
                                    item={item}
                                    isMarked={isWordMarked(item)}
                                    onToggleMark={() => toggleMarkedWord(item)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {markedWords.length > 0 && (
                         <div>
                            <h2 className="text-2xl font-bold mb-4 mt-8 border-t border-gray-700 pt-6">Revision List</h2>
                            <div className="space-y-4">
                                {markedWords.map((item) => (
                                    <VocabularyCard
                                        key={`marked-${item.word}`} 
                                        item={item} 
                                        isMarked={true}
                                        onToggleMark={() => toggleMarkedWord(item)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </aside>
    );
};