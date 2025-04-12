import React from 'react';
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
    toggleAnswer,
    isOptionSelected,
    goToNextQuestion,
    goToPreviousQuestion,
  } = useQuizState();

  if (!currentQuestion) {
    return <div className="p-8 text-center">Loading...</div>;
  }

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
        onToggleAnswer={toggleAnswer}
        isOptionSelected={isOptionSelected}
      />

      <div className="mt-8 flex justify-between">
        <Button
          outline
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          className="px-6 py-2"
        >
          Previous
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