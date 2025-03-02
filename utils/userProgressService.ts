import { UserProgress, UserStats } from "../types/userProgress";
import { getAllTerms } from "./glossaryService";
import { getAllLessons } from "./lessonService";

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

  // Update ranking if terms were added
  if (completedTerms.length > progress.completedTerms.length) {
    await updateUserRanking();
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

  // Update ranking if lessons were added
  if (completedLessons.length > progress.completedLessons.length) {
    await updateUserRanking();
  }

  return updatedProgress;
}

/**
 * Get user stats for gamification
 */
export async function getUserStats(userId?: string): Promise<UserStats> {
  // Get user progress
  const progress = await getUserProgress();

  // Get all terms and lessons
  const allTerms = getAllTerms();
  const allLessons = await getAllLessons();

  // Calculate stats
  const termsLearned = progress.completedTerms.length;
  const totalTerms = allTerms.length;
  const lessonsCompleted = progress.completedLessons.length;
  const totalLessons = allLessons.length;

  // Mock ranking data (in production, this would come from an API)
  const ranking = progress.ranking || Math.floor(Math.random() * 100) + 1;
  const totalUsers = 1000;

  return {
    termsLearned,
    totalTerms,
    lessonsCompleted,
    totalLessons,
    ranking,
    totalUsers,
  };
}

/**
 * Update user's ranking
 */
export async function updateUserRanking(
  userId?: string
): Promise<UserProgress> {
  // Get existing progress
  const progress = await getUserProgress();

  // Calculate new ranking based on progress
  // In a real app, this would be calculated on the server
  // For now, we'll just simulate an improvement in ranking
  const currentRanking =
    progress.ranking || Math.floor(Math.random() * 100) + 1;
  const newRanking = Math.max(
    1,
    currentRanking - Math.floor(Math.random() * 5)
  );

  // Update ranking
  const updatedProgress = {
    ...progress,
    ranking: newRanking,
  };

  // Save (in production, this would be an API call)
  if (typeof window !== "undefined") {
    localStorage.setItem("userProgress", JSON.stringify(updatedProgress));
  }

  return updatedProgress;
}
