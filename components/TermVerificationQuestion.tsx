import React, { useState, useMemo } from "react";
import { GlossaryTerm } from "../types/glossary";

interface TermVerificationQuestionProps {
  term: GlossaryTerm;
  onCorrect: () => void;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

const TermVerificationQuestion: React.FC<TermVerificationQuestionProps> = ({
  term,
  onCorrect,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate multiple choice options for the term
  const options = useMemo(() => {
    // Correct option
    const correctOption: QuestionOption = {
      id: "correct",
      text: term.short_definition,
      isCorrect: true,
    };

    // These would ideally be generated dynamically based on other terms
    // or pre-defined in the glossary data
    const incorrectOptions: QuestionOption[] = [
      {
        id: "incorrect1",
        text: `A technology unrelated to ${term.term} that serves a different purpose.`,
        isCorrect: false,
      },
      {
        id: "incorrect2",
        text: `A common misconception about ${term.term} that is factually incorrect.`,
        isCorrect: false,
      },
    ];

    // Combine and shuffle
    return [...incorrectOptions, correctOption].sort(() => Math.random() - 0.5);
  }, [term]);

  const handleSubmit = () => {
    setIsSubmitted(true);

    // Check if answer is correct
    const isCorrect =
      options.find((o) => o.id === selectedOption)?.isCorrect || false;

    if (isCorrect) {
      // Give a moment to see feedback before proceeding
      setTimeout(onCorrect, 1000);
    }
  };

  return (
    <div className="verification-question">
      <p className="mb-4">Which of the following best describes {term.term}?</p>

      <div className="space-y-3 mb-4">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => !isSubmitted && setSelectedOption(option.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              isSubmitted
                ? option.isCorrect
                  ? "bg-green-50 border-green-300"
                  : selectedOption === option.id
                  ? "bg-red-50 border-red-300"
                  : "bg-white border-gray-200"
                : selectedOption === option.id
                ? "bg-blue-50 border-blue-300"
                : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            {option.text}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => !isSubmitted && onCorrect()}
          className="text-blue-600 hover:underline"
        >
          Skip this check
        </button>

        <button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitted}
          className={`px-4 py-2 rounded-lg ${
            !selectedOption || isSubmitted
              ? "bg-gray-200 text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors`}
        >
          {isSubmitted ? "Submitted" : "Check Answer"}
        </button>
      </div>

      {isSubmitted &&
        !options.find((o) => o.id === selectedOption)?.isCorrect && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 mb-2">Not quite right!</p>
            <p className="text-gray-700">The correct definition is:</p>
            <p className="font-medium mt-1">{term.short_definition}</p>
            <button
              onClick={onCorrect}
              className="mt-3 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Continue anyway
            </button>
          </div>
        )}
    </div>
  );
};

export default TermVerificationQuestion;
