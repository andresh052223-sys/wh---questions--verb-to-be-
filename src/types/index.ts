export type WhWord = 'WHAT' | 'WHERE' | 'WHEN' | 'WHO' | 'WHY' | 'HOW';

export interface WhWordInfo {
  word: WhWord;
  translation: string;
  pronunciation: string;
  usage: string;
  usageEs: string;
  exampleQuestion: string;
  exampleAnswer: string;
}

export interface PronounConjugation {
  pronoun: string;
  verb: 'am' | 'are' | 'is';
  spanish: string;
  sampleQuestion: string;
  sampleAnswer: string;
  moreExamples: Array<{
    question: string;
    answer: string;
  }>;
}

export interface GeneralKnowledgeExample {
  id: string;
  whWord: WhWord;
  question: string;
  questionEs: string;
  answer: string;
  answerEs: string;
  category: string;
}

export interface ScrambleQuestion {
  id: string;
  spanish: string;
  words: string[]; // Correct ordered words including punctuation '?'
  category: string;
  explanation?: string;
}

export interface MatchingPair {
  id: string;
  question: string;
  answer: string;
  whWord: WhWord;
}

export interface MatchingSet {
  id: string;
  title: string;
  pairs: MatchingPair[];
}

export interface ApprenticeProfile {
  name: string;
  program: string;
  registeredAt?: string;
}

export interface ApprenticeProgress {
  grammarReviewed: boolean;
  reviewedWhCount: number;
  examplesRevealed: string[]; // IDs
  activity1Completed: boolean;
  activity1Score: number;
  activity1Total: number;
  activity1Correct: number;
  activity1Incorrect: number;
  activity2Completed: boolean;
  activity2Score: number;
  activity2Total: number;
  activity2Correct: number;
}
