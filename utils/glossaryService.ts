import { GlossaryTerm } from "../types/glossary";
import { Lesson } from "./lessonService";
import glossaryData from "../data/glossary.json";
import axios from "axios";

/**
 * Get all glossary terms
 */
export const getAllTerms = (): GlossaryTerm[] => {
  return glossaryData as GlossaryTerm[];
};

/**
 * Get all glossary terms (async version for API compatibility)
 */
export const getAllTermsAsync = async (): Promise<GlossaryTerm[]> => {
  // In production, fetch from the API
  if (process.env.NODE_ENV === "production") {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL_PROD || "https://api.silv.app";
      const response = await axios.get(`${apiUrl}/glossary`);
      return response.data;
    } catch (error) {
      console.error("Error fetching glossary from API:", error);
      // Fallback to local data if API fails
      return glossaryData as GlossaryTerm[];
    }
  }

  // In development, use local data
  return glossaryData as GlossaryTerm[];
};

/**
 * Get a specific term by ID
 */
export function getTermById(termId: string): GlossaryTerm | undefined {
  const terms = getAllTerms();
  return terms.find((term) => term.id === termId);
}

/**
 * Get all terms required for a specific lesson
 */
export function getRequiredTermsForLesson(lesson: Lesson): GlossaryTerm[] {
  if (!lesson.required_terms || !lesson.required_terms.length) {
    return [];
  }

  return lesson.required_terms
    .map((termId) => getTermById(termId))
    .filter((term) => term !== undefined) as GlossaryTerm[];
}

/**
 * Check if a user has completed all required terms for a lesson
 */
export function hasCompletedRequiredTerms(
  userCompletedTerms: string[],
  lesson: Lesson
): boolean {
  if (!lesson.required_terms || !lesson.required_terms.length) {
    return true; // No required terms
  }

  return lesson.required_terms.every((termId) =>
    userCompletedTerms.includes(termId)
  );
}
