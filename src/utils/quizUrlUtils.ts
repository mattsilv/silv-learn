import { AnswerSelections } from '../types/quiz';

// Helper to encode answers into a query string using `optionId~priority` format, separated by `_`
export const encodeAnswersToQuery = (answers: AnswerSelections): string => {
  const params = new URLSearchParams();
  Object.entries(answers).forEach(([questionId, orderedOptions]) => {
    if (orderedOptions && orderedOptions.length > 0) {
      // Map options to 'optionId~priority' strings (priority is 1-based index)
      const prioritizedOptions = orderedOptions.map((optionId, index) => `${optionId}~${index + 1}`);
      params.set(`q${questionId}`, prioritizedOptions.join('_')); // Join with underscore
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper to decode answers from a query string, supporting the new `optionId~priority` format
export const decodeAnswersFromQuery = (queryString: string): AnswerSelections => {
  const search = typeof queryString === 'string' ? queryString : '';
  const params = new URLSearchParams(search);
  const decodedAnswers: AnswerSelections = {};

  for (const [key, value] of params.entries()) {
    if (key.startsWith('q') && value) {
      const questionId = parseInt(key.substring(1), 10);
      if (!isNaN(questionId)) {
        // Split by underscore
        const pairs = value.split('_');
        const optionsWithPriority: { id: string; priority: number }[] = [];

        pairs.forEach(pair => {
          // Handle both old format (just ID) and new format (ID~priority)
          const parts = pair.split('~'); // Split by tilde now
          const optionId = parts[0];
          const priority = parts.length > 1 ? parseInt(parts[1], 10) : -1; // Assign default priority if missing

          if (optionId && !isNaN(priority)) {
             optionsWithPriority.push({ id: optionId, priority: priority });
          } else if (optionId && parts.length === 1) {
            // Fallback for old format or incomplete pair - assign max priority to appear last? Or index?
            // Let's use index as a fallback priority for now, assuming old format means order didn't matter.
            optionsWithPriority.push({ id: optionId, priority: optionsWithPriority.length + 1 });
          }
        });

        // Sort by priority
        optionsWithPriority.sort((a, b) => a.priority - b.priority);

        // Store only the ordered IDs
        if (optionsWithPriority.length > 0) {
          decodedAnswers[questionId] = optionsWithPriority.map(opt => opt.id);
        }
      }
    }
  }
  return decodedAnswers;
}; 