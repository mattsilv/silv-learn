import lessonData from "../data/lessons.json";

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
  duration_minutes: number;
  created_at: string;
  updated_at: string;
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
