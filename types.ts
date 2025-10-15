export interface FillInTheBlankExercise {
  id: string;
  sentence: string;
  correctAnswer: string;
  baseVerb: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface RevisionCard {
  title: string;
  content: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
  urduTranslation: string;
}

export interface GrammarError {
  error: string;
  correction: string;
  explanation: string;
}

export interface TutorTopic {
  topic: string;
  steps: string[];
}

export interface TutorFeedback {
  isCorrect: boolean;
  feedback: string;
  correctedSentence?: string;
}

export type TenseStatus = 'locked' | 'unlocked' | 'completed';

export interface EnhancedVocabularyItem {
  word: string;
  source: string; // e.g., "From the movie 'Inception'"
  example: string;
  urduTranslation: string;
  isVerb: boolean;
  v1?: string; // Base form
  v2?: string; // Past simple
  v3?: string; // Past participle
}

export interface SentenceStructure {
  type: string; // 'Positive', 'Negative', 'Interrogative'
  formula: string;
  example: string;
}

export interface TenseDetail {
  tenseName: string;
  description: string;
  structures: SentenceStructure[];
}