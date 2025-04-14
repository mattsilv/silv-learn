export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
}

export interface QuizData {
  title: string;
  instructions: string;
  version: string;
  questions: Question[];
}

export type AnswerSelections = Record<number, string[]>;

export interface LearningStyleResult {
  style: string;
  description: string;
  score: number;
  percentage: number;
}

export type LearningStyleResults = Record<string, LearningStyleResult>;