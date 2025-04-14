import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizState } from '../hooks/useQuizState';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizProgress from '../components/quiz/QuizProgress';
import { Heading } from '../components/catalyst/heading';
import { Text } from '../components/catalyst/text';
import { Button } from '../components/catalyst/button';
import { PRIMARY_BUTTON_COLOR } from '../config/theme';

const QuizPage: React.FC = () => {
  const {
    data,
    currentQuestion,
    totalQuestions,
    currentQuestionNumber,
    isFirstQuestion,
    isLastQuestion,
    progress,
    answers,
    toggleAnswer,
    reorderAnswers,
    goToNextQuestion,
    goToPreviousQuestion,
    clearAllAnswers,
  } = useQuizState();

  if (!currentQuestion) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const currentSelectedOptionIds = answers[currentQuestion.id] || [];

  const handleBackAction = () => {
    if (isFirstQuestion) {
      clearAllAnswers();
    } else {
      goToPreviousQuestion();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <Heading level={1} className="mb-3">{data.title}</Heading>
        <Text className="mb-6">{data.instructions}</Text>
        
        <QuizProgress
          currentQuestion={currentQuestionNumber}
          totalQuestions={totalQuestions}
          progress={progress}
        />
      </header>

      <QuestionCard
        question={currentQuestion}
        selectedOptionIds={currentSelectedOptionIds}
        onToggleAnswer={toggleAnswer}
        onReorderAnswers={reorderAnswers}
      />

      <div className="mt-8 flex justify-between">
        <Button
          outline
          onClick={handleBackAction}
          className="px-6 py-2"
        >
          {isFirstQuestion ? 'Start Over' : 'Previous'}
        </Button>
        
        <Button
          color={PRIMARY_BUTTON_COLOR}
          onClick={goToNextQuestion}
          className="px-6 py-2"
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default QuizPage;