import React from 'react';
import { Question } from '../../types/quiz';
import { Heading } from '../catalyst/heading';
import { Text } from '../catalyst/text';

interface QuestionCardProps {
  question: Question;
  onToggleAnswer: (questionId: number, optionId: string) => void;
  isOptionSelected: (questionId: number, optionId: string) => boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onToggleAnswer,
  isOptionSelected,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <Heading level={2} className="mb-6 text-center">
        {question.question}
      </Heading>
      
      <div className="mb-4">
        <Text className="text-lg font-medium">Select all that apply:</Text>
      </div>
      
      <div className="space-y-4">
        {question.options.map((option) => (
          <div 
            key={option.id} 
            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            onClick={() => onToggleAnswer(question.id, option.id)}
          >
            <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center border-2 ${isOptionSelected(question.id, option.id) 
              ? 'bg-indigo-600 border-indigo-600' 
              : 'border-gray-300 dark:border-gray-600'} rounded`}>
              {isOptionSelected(question.id, option.id) && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <span className="text-gray-800 dark:text-white text-base">
              {option.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;