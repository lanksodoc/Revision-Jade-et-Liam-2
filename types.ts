
export enum Grade {
  CE1 = 'CE1',
  CM2 = 'CM2'
}

export enum Subject {
  SVT = 'SVT / Sciences',
  HISTORY = 'Histoire',
  GEOGRAPHY = 'Géographie',
  MATH = 'Mathématiques'
}

export type QuestionType = 'QCM' | 'QROC' | 'MATCHING';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  // Used for QCM
  options?: string[];
  correctAnswer?: string;
  // Used for QROC
  acceptedAnswers?: string[];
  // Used for MATCHING
  pairs?: MatchingPair[];
  explanation: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  isFinished: boolean;
  questions: Question[];
  grade: Grade | null;
  subject: Subject | null;
}
