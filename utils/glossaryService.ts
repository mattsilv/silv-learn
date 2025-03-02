import { GlossaryTerm } from "../types/glossary";
import { Lesson } from "./lessonService";
import glossaryData from "../data/glossary.json";

/**
 * Get all glossary terms
 */
export function getAllTerms(): GlossaryTerm[] {
  return glossaryData as GlossaryTerm[];
}

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
