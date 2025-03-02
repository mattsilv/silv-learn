import { UserProgress } from "../types/userProgress";

/**
 * Get user progress data including completed terms
 */
export async function getUserProgress(userId?: string): Promise<UserProgress> {
  // In production, this would be an API call
  // For now, mock from localStorage
  if (typeof window !== "undefined") {
    const savedProgress = localStorage.getItem("userProgress");
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
  }

  // Default empty progress
  return {
    completedLessons: [],
    completedTerms: [],
  };
}

/**
 * Update user's completed terms
 */
export async function updateUserCompletedTerms(
  completedTerms: string[],
  userId?: string
): Promise<UserProgress> {
  // Get existing progress
  const progress = await getUserProgress();

  // Update completed terms
  const updatedProgress = {
    ...progress,
    completedTerms,
  };

  // Save (in production, this would be an API call)
  if (typeof window !== "undefined") {
    localStorage.setItem("userProgress", JSON.stringify(updatedProgress));
  }

  return updatedProgress;
}

/**
 * Update user's completed lessons
 */
export async function updateUserCompletedLessons(
  completedLessons: string[],
  userId?: string
): Promise<UserProgress> {
  // Get existing progress
  const progress = await getUserProgress();

  // Update completed lessons
  const updatedProgress = {
    ...progress,
    completedLessons,
  };

  // Save (in production, this would be an API call)
  if (typeof window !== "undefined") {
    localStorage.setItem("userProgress", JSON.stringify(updatedProgress));
  }

  return updatedProgress;
}
