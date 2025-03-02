import { GlossaryTerm } from "../types/glossary";

/**
 * Processes text to identify and highlight glossary terms
 * @param text The text content to process
 * @param glossaryTerms Array of glossary terms
 * @param userLearnedTerms Array of term IDs the user has already learned
 * @param manuallyTaggedTerms Optional array of manually tagged term IDs
 * @returns Processed HTML with term highlighting spans
 */
export function processTextWithTerms(
  text: string,
  glossaryTerms: GlossaryTerm[],
  userLearnedTerms: string[],
  manuallyTaggedTerms: string[] = []
): string {
  let processedHtml = text;

  // First handle any manually tagged terms
  // Format: {{term:term-id}}
  const manualTagRegex = /\{\{term:([\w-]+)\}\}/g;
  processedHtml = processedHtml.replace(manualTagRegex, (match, termId) => {
    const term = glossaryTerms.find((t) => t.id === termId);
    if (!term) return match; // If term not found, leave as is

    // Only highlight if user has learned this term
    if (userLearnedTerms.includes(termId)) {
      return `<span class="term-highlight manual-term" data-term-id="${termId}">${term.term}</span>`;
    } else {
      return term.term; // Replace tag but don't highlight
    }
  });

  // Then do automatic detection for all terms
  // Sort terms by length (longest first) to handle substrings properly
  const sortedTerms = [...glossaryTerms].sort((a, b) => {
    return b.term.length - a.term.length;
  });

  sortedTerms.forEach((term) => {
    // Skip if user hasn't learned this term
    if (!userLearnedTerms.includes(term.id)) return;

    // Create a pattern that includes the main term and all aliases
    const termPatterns = [term.term, ...(term.aliases || [])];

    termPatterns.forEach((pattern) => {
      // Clean pattern to escape special regex chars
      const cleanPattern = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

      // Create regex that matches the word with optional 's, s, or punctuation
      const regex = new RegExp(`\\b${cleanPattern}(?:'s|s)?\\b`, "gi");

      // Don't replace inside HTML tags or already processed terms
      processedHtml = processedHtml.replace(regex, (match, offset) => {
        // Skip if this is inside an HTML tag or already highlighted
        const previousText = processedHtml.substring(0, offset);
        const isInsideTag =
          previousText.lastIndexOf("<") > previousText.lastIndexOf(">") ||
          previousText.includes(`class="term-highlight"`);

        if (isInsideTag) return match;

        return `<span class="term-highlight auto-term" data-term-id="${term.id}">${match}</span>`;
      });
    });
  });

  return processedHtml;
}

/**
 * Extract manually tagged terms from text
 * @param text The content to analyze
 * @returns Array of term IDs that are manually tagged
 */
export function extractManualTerms(text: string): string[] {
  const manualTags: string[] = [];
  const regex = /\{\{term:([\w-]+)\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    manualTags.push(match[1]); // Add the term ID
  }

  return manualTags;
}
