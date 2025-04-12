import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AnswerSelections, QuizData } from '../types/quiz';
import quizData from '../data/learning-style.json';

// Helper to encode answers into a query string
const encodeAnswersToQuery = (answers: AnswerSelections): string => {
  const params = new URLSearchParams();
  Object.entries(answers).forEach(([questionId, selectedOptions]) => {
    if (selectedOptions.length > 0) {
      // Join multiple selections with a comma
      params.set(`q${questionId}`, selectedOptions.join(','));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper to decode answers from a query string
const decodeAnswersFromQuery = (queryString: string): AnswerSelections => {
  const params = new URLSearchParams(queryString);
  const decodedAnswers: AnswerSelections = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith('q')) {
      const questionId = parseInt(key.substring(1), 10);
      if (!isNaN(questionId) && value) {
        // Split comma-separated values
        decodedAnswers[questionId] = value.split(',');
      }
    }
  }
  return decodedAnswers;
};

export function useQuizState() {
  const navigate = useNavigate();
  const location = useLocation(); // Use location to get query string
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const currentQuestionNumber = questionNumber ? parseInt(questionNumber, 10) : 1;

  // Initialize answers from URL query string
  const [answers, setAnswers] = useState<AnswerSelections>(() =>
    decodeAnswersFromQuery(location.search)
  );
  const [data] = useState<QuizData>(quizData as QuizData);

  const currentQuestion = data.questions.find(q => q.id === currentQuestionNumber);
  const totalQuestions = data.questions.length;
  const isFirstQuestion = currentQuestionNumber === 1;
  const isLastQuestion = currentQuestionNumber === totalQuestions;
  const progress = (currentQuestionNumber / totalQuestions) * 100;

  // Effect to navigate to the correct question number based on URL path
  // Also ensures URL reflects current state if landing directly
  useEffect(() => {
    if (currentQuestionNumber > totalQuestions || currentQuestionNumber < 1 || isNaN(currentQuestionNumber)) {
       navigate(`/quiz/1${encodeAnswersToQuery(answers)}`, { replace: true });
    }
     // Ensure URL always reflects current question number + answers
     const targetPath = `/quiz/${currentQuestionNumber}${encodeAnswersToQuery(answers)}`;
     if (location.pathname + location.search !== targetPath) {
        navigate(targetPath, { replace: true });
     }
  // Only re-run if the question number param changes, not on every answer change here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionNumber, totalQuestions, navigate]);


  // Update URL query string whenever answers change
  const updateUrlWithAnswers = useCallback((newAnswers: AnswerSelections) => {
     const queryString = encodeAnswersToQuery(newAnswers);
     // Use replace to not pollute browser history with every selection change
     navigate(`/quiz/${currentQuestionNumber}${queryString}`, { replace: true });
  }, [navigate, currentQuestionNumber]);

  // Go to next question, preserving answers in URL
  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      // Navigate keeping the current query string logic managed by updateUrlWithAnswers
      navigate(`/quiz/${currentQuestionNumber + 1}${encodeAnswersToQuery(answers)}`);
    } else {
      // Navigate to results, passing the answers
      navigate(`/results${encodeAnswersToQuery(answers)}`);
    }
  };

  // Go to previous question, preserving answers in URL
  const goToPreviousQuestion = () => {
    if (!isFirstQuestion) {
       // Navigate keeping the current query string logic managed by updateUrlWithAnswers
      navigate(`/quiz/${currentQuestionNumber - 1}${encodeAnswersToQuery(answers)}`);
    }
  };

  // Toggle an answer selection and update URL
  const toggleAnswer = (questionId: number, optionId: string) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const newAnswersArray = currentAnswers.includes(optionId)
        ? currentAnswers.filter(id => id !== optionId)
        : [...currentAnswers, optionId];

      const newAnswersState = {
        ...prev,
        [questionId]: newAnswersArray.length > 0 ? newAnswersArray : undefined, 
      };

      // Filter out undefined entries before returning state and updating URL
      const finalAnswersState = Object.entries(newAnswersState).reduce<AnswerSelections>((acc, [key, value]) => {
        if (value !== undefined) {
          acc[parseInt(key)] = value;
        }
        return acc;
      }, {});

      updateUrlWithAnswers(finalAnswersState); // Update the URL with filtered answers
      return finalAnswersState; // Return the correctly typed state
    });
  };

  // Check if an option is selected (reads from local state)
  const isOptionSelected = (questionId: number, optionId: string): boolean => {
    const selectedOptions = answers[questionId] || [];
    return selectedOptions.includes(optionId);
  };

  // REMOVED generateResultsQueryParams as results page will now decode from answers

  return {
    data,
    currentQuestion,
    totalQuestions,
    currentQuestionNumber,
    isFirstQuestion,
    isLastQuestion,
    progress,
    answers, // Expose raw answers if needed
    toggleAnswer,
    isOptionSelected,
    goToNextQuestion,
    goToPreviousQuestion,
  };
}