import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AnswerSelections, QuizData } from '../types/quiz';
import quizData from '../data/learning-style.json';
import { encodeAnswersToQuery, decodeAnswersFromQuery } from '../utils/quizUrlUtils';

export function useQuizState() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const currentQuestionNumber = questionNumber ? parseInt(questionNumber, 10) : 1;

  const [answers, setAnswers] = useState<AnswerSelections>(() =>
    decodeAnswersFromQuery(location.search)
  );
  const [data] = useState<QuizData>(quizData as QuizData);

  const currentQuestion = data.questions.find(q => q.id === currentQuestionNumber);
  const totalQuestions = data.questions.length;
  const isFirstQuestion = currentQuestionNumber === 1;
  const isLastQuestion = currentQuestionNumber === totalQuestions;
  const progress = (currentQuestionNumber / totalQuestions) * 100;

  useEffect(() => {
    if (currentQuestionNumber > totalQuestions || currentQuestionNumber < 1 || isNaN(currentQuestionNumber)) {
       navigate(`/quiz/1${encodeAnswersToQuery(answers)}`, { replace: true });
    }
     const targetPath = `/quiz/${currentQuestionNumber}${encodeAnswersToQuery(answers)}`;
     if (location.pathname + location.search !== targetPath) {
        navigate(targetPath, { replace: true });
     }
  }, [currentQuestionNumber, totalQuestions, navigate]);

  const updateUrlWithAnswers = useCallback((newAnswers: AnswerSelections) => {
     const queryString = encodeAnswersToQuery(newAnswers);
     navigate(`/quiz/${currentQuestionNumber}${queryString}`, { replace: true });
  }, [navigate, currentQuestionNumber]);

  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      navigate(`/quiz/${currentQuestionNumber + 1}${encodeAnswersToQuery(answers)}`);
    } else {
      navigate(`/results${encodeAnswersToQuery(answers)}`);
    }
  };

  const goToPreviousQuestion = () => {
    if (!isFirstQuestion) {
      navigate(`/quiz/${currentQuestionNumber - 1}${encodeAnswersToQuery(answers)}`);
    }
  };

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

      const finalAnswersState = Object.entries(newAnswersState).reduce<AnswerSelections>((acc, [key, value]) => {
        if (value !== undefined) {
          acc[parseInt(key)] = value;
        }
        return acc;
      }, {});

      updateUrlWithAnswers(finalAnswersState);
      return finalAnswersState;
    });
  };

  const isOptionSelected = (questionId: number, optionId: string): boolean => {
    const selectedOptions = answers[questionId] || [];
    return selectedOptions.includes(optionId);
  };

  return {
    data,
    currentQuestion,
    totalQuestions,
    currentQuestionNumber,
    isFirstQuestion,
    isLastQuestion,
    progress,
    answers,
    toggleAnswer,
    isOptionSelected,
    goToNextQuestion,
    goToPreviousQuestion,
  };
}