import React, { useState } from "react";
import { GlossaryTerm } from "../types/glossary";
import TermHighlighter from "./TermHighlighter";
import TermVerificationQuestion from "./TermVerificationQuestion";

interface TermLearningModuleProps {
  requiredTerms: GlossaryTerm[];
  glossaryTerms: GlossaryTerm[];
  userLearnedTerms: string[];
  onTermsCompleted: (completedTermIds: string[]) => void;
}

const TermLearningModule: React.FC<TermLearningModuleProps> = ({
  requiredTerms,
  glossaryTerms,
  userLearnedTerms,
  onTermsCompleted,
}) => {
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [completedTermIds, setCompletedTermIds] = useState<string[]>([]);
  const [showVerification, setShowVerification] = useState(false);

  // Current term being learned
  const currentTerm = requiredTerms[currentTermIndex];

  // Combined list of already learned terms plus ones completed in this session
  const allLearnedTerms = [...userLearnedTerms, ...completedTermIds];

  // Handle completing the current term
  const handleCompleteTerm = () => {
    const updatedCompleted = [...completedTermIds, currentTerm.id];
    setCompletedTermIds(updatedCompleted);

    // Move to next term or finish
    if (currentTermIndex < requiredTerms.length - 1) {
      setCurrentTermIndex(currentTermIndex + 1);
      setShowVerification(false);
    } else {
      // All terms completed
      onTermsCompleted(updatedCompleted);
    }
  };

  return (
    <div className="term-learning-module bg-white rounded-lg shadow-md p-6">
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          Learning {currentTermIndex + 1} of {requiredTerms.length} terms
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentTermIndex +
                  (completedTermIds.includes(currentTerm.id) ? 1 : 0)) /
                  requiredTerms.length) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Term card */}
      <div className="term-card">
        <h2 className="text-2xl font-bold mb-2">{currentTerm.term}</h2>

        {currentTerm.full_form && (
          <div className="text-gray-500 mb-4">
            <span className="font-medium">Full form:</span>{" "}
            {currentTerm.full_form}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Definition</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <TermHighlighter
              content={
                currentTerm.long_definition || currentTerm.short_definition
              }
              glossaryTerms={glossaryTerms}
              userLearnedTerms={allLearnedTerms}
            />
          </div>
        </div>

        {currentTerm.examples && currentTerm.examples.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Examples</h3>
            <ul className="list-disc pl-5 space-y-1">
              {currentTerm.examples.map((example, i) => (
                <li key={i} className="text-gray-700">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!showVerification ? (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowVerification(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              I understand this term
            </button>
          </div>
        ) : (
          <div className="verification-section mt-6 border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Quick Check</h3>
            <TermVerificationQuestion
              term={currentTerm}
              onCorrect={handleCompleteTerm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TermLearningModule;
