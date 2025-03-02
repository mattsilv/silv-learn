export interface UserProgress {
  userId?: string;
  completedLessons: string[]; // lesson IDs
  completedTerms: string[]; // term IDs
}
