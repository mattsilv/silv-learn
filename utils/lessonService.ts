import lessonData from "../data/lessons.json";
import axios from "axios";

// Types
export type ContentSection = {
  title: string;
  text: string;
};

export type ReadingContent = {
  content: ContentSection[];
  image: {
    url: string;
    alt: string;
    caption: string;
  };
};

export type ListeningContent = {
  transcript: string;
  audio_url: string;
};

export type WatchingContent = {
  transcript: string;
  video_url: string;
  thumbnail_url: string;
  key_points: string[];
};

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
};

export type LearningStyles = {
  reading: ReadingContent;
  listening: ListeningContent;
  watching: WatchingContent;
};

export type LearningStyle = "reading" | "listening" | "watching";

export type Lesson = {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  topic: string;
  level: number;
  required_terms?: string[];
  learning_styles: LearningStyles;
  quiz: {
    questions: QuizQuestion[];
  };
  metadata: {
    tags: string[];
    difficulty_level: string;
    prerequisites: string[];
  };
};

/**
 * Get all lessons
 * In a real app, this would fetch from an API or database
 */
export const getAllLessons = async (): Promise<Lesson[]> => {
  // In production, fetch from the API
  if (process.env.NODE_ENV === "production") {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL_PROD || "https://api.silv.app";
      const response = await axios.get(`${apiUrl}/lessons`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lessons from API:", error);
      // Fallback to local data if API fails
      return lessonData as Lesson[];
    }
  }

  // In development, use local data
  return lessonData as Lesson[];
};

/**
 * Get a lesson by ID
 * In a real app, this would fetch from an API or database
 */
export const getLessonById = async (id: number): Promise<Lesson | null> => {
  const lessons = await getAllLessons();
  return lessons.find((lesson) => lesson.id === id) || null;
};

/**
 * Get a lesson by slug
 * In a real app, this would fetch from an API or database
 */
export const getLessonBySlug = async (slug: string): Promise<Lesson | null> => {
  const lessons = await getAllLessons();
  return lessons.find((lesson) => lesson.slug === slug) || null;
};

/**
 * Get all lesson slugs
 * Useful for generating static paths in Next.js
 */
export const getAllLessonSlugs = async (): Promise<string[]> => {
  const lessons = await getAllLessons();
  return lessons.map((lesson) => lesson.slug);
};

/**
 * Get all available topics
 */
export const getAllTopics = async (): Promise<string[]> => {
  const lessons = await getAllLessons();
  const topicsSet = new Set(lessons.map((lesson) => lesson.topic));
  return Array.from(topicsSet);
};

/**
 * Get lessons by topic
 */
export const getLessonsByTopic = async (topic: string): Promise<Lesson[]> => {
  const lessons = await getAllLessons();
  return lessons.filter((lesson) => lesson.topic === topic);
};

/**
 * Get lessons by topic and level
 */
export const getLessonsByTopicAndLevel = async (
  topic: string,
  level: number
): Promise<Lesson[]> => {
  const lessons = await getLessonsByTopic(topic);
  return lessons.filter((lesson) => lesson.level === level);
};

/**
 * Check if user has completed all lessons for a specific level in a topic
 */
export const hasCompletedLevelForTopic = async (
  topic: string,
  level: number,
  completedLessonIds: string[]
): Promise<boolean> => {
  const lessons = await getLessonsByTopicAndLevel(topic, level);

  // If there are no lessons at this level, consider it complete
  if (lessons.length === 0) {
    return true;
  }

  // Check if all lessons at this level have been completed
  return lessons.every((lesson) =>
    completedLessonIds.includes(lesson.id.toString())
  );
};

/**
 * Get the highest available level for a topic based on user's progress
 */
export const getHighestAvailableLevelForTopic = async (
  topic: string,
  completedLessonIds: string[]
): Promise<number> => {
  const lessons = await getLessonsByTopic(topic);
  const levelsArray = lessons.map((lesson) => lesson.level);
  const uniqueLevels = Array.from(new Set(levelsArray)).sort((a, b) => a - b);

  // Always allow level 100 courses
  if (uniqueLevels.length === 0 || !uniqueLevels.includes(100)) {
    return 100;
  }

  // Find the highest level where all previous levels are completed
  let highestAvailableLevel = 100;

  for (let i = 0; i < uniqueLevels.length; i++) {
    const currentLevel = uniqueLevels[i];

    // Skip level 100 as it's always available
    if (currentLevel === 100) continue;

    // Check if previous level is completed
    const previousLevel = uniqueLevels[i - 1] || 100;
    const previousLevelCompleted = await hasCompletedLevelForTopic(
      topic,
      previousLevel,
      completedLessonIds
    );

    if (previousLevelCompleted) {
      highestAvailableLevel = currentLevel;
    } else {
      break;
    }
  }

  return highestAvailableLevel;
};
