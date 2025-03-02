export interface UserProgress {
  userId?: string;
  completedLessons: string[]; // lesson IDs
  completedTerms: string[]; // term IDs
  ranking?: number;
}

export interface UserStats {
  termsLearned: number;
  totalTerms: number;
  lessonsCompleted: number;
  totalLessons: number;
  ranking: number;
  totalUsers: number;
}
