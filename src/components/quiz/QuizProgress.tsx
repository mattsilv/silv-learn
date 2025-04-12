import React from 'react';
import { Text } from '../catalyst/text';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  progress,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm">
          <Text>
            Question {currentQuestion} of {totalQuestions}
          </Text>
        </span>
        <span className="text-sm">
          <Text>
            {Math.round(progress)}%
          </Text>
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgress;