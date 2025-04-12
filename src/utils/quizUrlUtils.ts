import { AnswerSelections } from '../types/quiz';

// Helper to encode answers into a query string using hyphens for multiple selections
export const encodeAnswersToQuery = (answers: AnswerSelections): string => {
  const params = new URLSearchParams();
  Object.entries(answers).forEach(([questionId, selectedOptions]) => {
    if (selectedOptions && selectedOptions.length > 0) {
      // Sort options for consistent URL generation
      const sortedOptions = [...selectedOptions].sort();
      params.set(`q${questionId}`, sortedOptions.join('-')); 
    }
  });
  const queryString = params.toString();
  // Return empty string if no answers, otherwise return the query string starting with ?
  return queryString ? `?${queryString}` : ''; 
};

// Helper to decode answers from a query string, supporting both comma and hyphen separators
export const decodeAnswersFromQuery = (queryString: string): AnswerSelections => {
  // Ensure queryString is treated as a string, default to empty if null/undefined
  const search = typeof queryString === 'string' ? queryString : '';
  const params = new URLSearchParams(search);
  const decodedAnswers: AnswerSelections = {};

  for (const [key, value] of params.entries()) {
    if (key.startsWith('q') && value) { // Ensure value is not empty
      const questionId = parseInt(key.substring(1), 10);
      if (!isNaN(questionId)) {
        // Split by comma (old) or hyphen (new) for backward compatibility
        // Filter out any empty strings that might result from splitting (e.g., trailing separator)
        const answers = value.split(/,|-/).filter(ans => ans !== '');
        if (answers.length > 0) {
            decodedAnswers[questionId] = answers;
        }
      }
    }
  }
  return decodedAnswers;
}; 