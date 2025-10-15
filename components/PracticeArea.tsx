import React, { useState, useEffect, useCallback } from 'react';
import { generateFillInTheBlanks, generateQuiz, generateTenseDetails } from '../services/geminiService';
import type { FillInTheBlankExercise, QuizQuestion, TenseDetail } from '../types';
import { Loader } from './ui/Loader';
import { Button } from './ui/Button';

interface PracticeAreaProps {
  activeTense: string;
  onTenseComplete: (tense: string) => void;
}

const MIN_PASS_PERCENTAGE = 0.8; // 80%

export const PracticeArea: React.FC<PracticeAreaProps> = ({ activeTense, onTenseComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenseDetails, setTenseDetails] = useState<TenseDetail | null>(null);
  const [exercises, setExercises] = useState<FillInTheBlankExercise[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  const [fillInAnswers, setFillInAnswers] = useState<Record<string, string>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  
  const [isGraded, setIsGraded] = useState(false);
  const [fillInScore, setFillInScore] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  const fetchContent = useCallback(async (tense: string) => {
    setIsLoading(true);
    setError(null);
    setTenseDetails(null);
    setExercises([]);
    setQuestions([]);
    setIsGraded(false);
    setFillInAnswers({});
    setQuizAnswers({});
    try {
      const [fetchedDetails, fetchedExercises, fetchedQuestions] = await Promise.all([
        generateTenseDetails(tense),
        generateFillInTheBlanks(tense),
        generateQuiz(tense)
      ]);
      setTenseDetails(fetchedDetails);
      setExercises(fetchedExercises);
      setQuestions(fetchedQuestions);
    } catch (err) {
      console.error(`Failed to fetch content for ${tense}:`, err);
      setError("Could not load exercises. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent(activeTense);
  }, [activeTense, fetchContent]);

  const handleGrade = () => {
    // Grade Fill-in-the-blanks
    let currentFillInScore = 0;
    exercises.forEach(ex => {
        if (fillInAnswers[ex.id]?.trim().toLowerCase() === ex.correctAnswer.toLowerCase()) {
            currentFillInScore++;
        }
    });
    setFillInScore(currentFillInScore);

    // Grade Quiz
    let currentQuizScore = 0;
    questions.forEach(q => {
        if (quizAnswers[q.id] === q.correctAnswer) {
            currentQuizScore++;
        }
    });
    setQuizScore(currentQuizScore);
    
    setIsGraded(true);

    // Check for pass
    const fillInPass = (currentFillInScore / exercises.length) >= MIN_PASS_PERCENTAGE;
    const quizPass = (currentQuizScore / questions.length) >= MIN_PASS_PERCENTAGE;

    if (fillInPass && quizPass) {
        onTenseComplete(activeTense);
    }
  };

  const handleTryAgain = () => {
    fetchContent(activeTense);
  };

  if (isLoading) {
    return <div className="flex justify-center pt-20"><Loader /></div>
  }
  if (error) {
    return <p className="text-red-400 text-center pt-20">{error}</p>
  }

  const fillInPassed = (fillInScore / exercises.length) >= MIN_PASS_PERCENTAGE;
  const quizPassed = (quizScore / questions.length) >= MIN_PASS_PERCENTAGE;

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold">{activeTense}</h2>
      
      {tenseDetails && (
        <section className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
          <p className="text-gray-300 mb-4">{tenseDetails.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tenseDetails.structures.map(structure => (
              <div key={structure.type} className="bg-gray-800 p-4 rounded-md">
                <h4 className="font-bold text-lg text-white mb-2">{structure.type}</h4>
                <p className="text-sm text-gray-400 font-mono bg-gray-900 p-2 rounded mb-2">
                  <span className="font-semibold">Formula:</span> {structure.formula}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Example:</span> <em className="italic">"{structure.example}"</em>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isGraded && (
        <div className={`p-4 rounded-lg border ${fillInPassed && quizPassed ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'}`}>
            <h3 className="text-2xl font-bold mb-2">{fillInPassed && quizPassed ? "Level Passed!" : "Try Again!"}</h3>
            <p>Fill in the Blanks Score: {fillInScore} / {exercises.length} {fillInPassed ? '✅' : '❌'}</p>
            <p>Quiz Score: {quizScore} / {questions.length} {quizPassed ? '✅' : '❌'}</p>
            {!(fillInPassed && quizPassed) && <p className="mt-2 text-sm">You need to score at least 80% on both sections to unlock the next tense.</p>}
        </div>
      )}

      {/* Fill in the Blanks Section */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold border-b border-gray-700 pb-2">Fill in the Blanks</h3>
        {exercises.map((ex, index) => (
          <div key={ex.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-300 mb-2">{index + 1}. {ex.sentence.replace('___', '______')}</p>
            <input
              type="text"
              value={fillInAnswers[ex.id] || ''}
              onChange={(e) => setFillInAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
              className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1 w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-white"
              placeholder={`Base verb: ${ex.baseVerb}`}
              disabled={isGraded}
            />
            {isGraded && (() => {
                const isCorrect = fillInAnswers[ex.id]?.trim().toLowerCase() === ex.correctAnswer.toLowerCase();
                return (
                    <div className="mt-2 text-sm">
                        <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            Correct answer: {ex.correctAnswer}
                        </p>
                        {!isCorrect && ex.explanation && (
                            <p className="text-yellow-400 mt-1">
                                <span className="font-bold">Reason:</span> {ex.explanation}
                            </p>
                        )}
                    </div>
                );
            })()}
          </div>
        ))}
      </section>

      {/* Quiz Section */}
      <section className="space-y-6">
        <h3 className="text-2xl font-semibold border-b border-gray-700 pb-2">Multiple-Choice Quiz</h3>
        {questions.map((q) => (
          <div key={q.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="font-semibold text-white mb-3">{q.question}</p>
            <div className="space-y-2">
              {q.options.map(option => {
                const isSelected = quizAnswers[q.id] === option;
                let optionClasses = "w-full text-left p-2 rounded-md transition-colors ";
                if (isGraded) {
                    if (option === q.correctAnswer) optionClasses += "bg-green-800/50 border border-green-600";
                    else if (isSelected) optionClasses += "bg-red-800/50 border border-red-600";
                    else optionClasses += "bg-gray-800 border border-gray-700";
                } else {
                    optionClasses += isSelected ? "bg-white text-black" : "bg-gray-800 hover:bg-gray-700";
                }
                return (
                  <button
                    key={option}
                    onClick={() => setQuizAnswers(prev => ({...prev, [q.id]: option}))}
                    className={optionClasses}
                    disabled={isGraded}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>
      
      {isGraded ? (
          !(fillInPassed && quizPassed) && (
              <Button onClick={handleTryAgain} className="w-full py-3 text-lg">
                  Try Again
              </Button>
          )
      ) : (
          <Button onClick={handleGrade} className="w-full py-3 text-lg">
              Submit & Grade
          </Button>
      )}
    </div>
  );
};