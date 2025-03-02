import React from "react";
import { GlossaryTerm } from "../types/glossary";
import { CheckCircle } from "lucide-react";

interface TermModuleListProps {
  glossaryTerms: GlossaryTerm[];
  userCompletedTerms: string[];
}

const TermModuleList: React.FC<TermModuleListProps> = ({
  glossaryTerms,
  userCompletedTerms,
}) => {
  // Group terms by first letter for better organization
  const groupedTerms: { [key: string]: GlossaryTerm[] } = glossaryTerms.reduce(
    (acc, term) => {
      const firstLetter = term.term.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(term);
      return acc;
    },
    {} as { [key: string]: GlossaryTerm[] }
  );

  // Sort the keys alphabetically
  const sortedGroups = Object.keys(groupedTerms).sort();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Available Term Modules</h2>

      <div className="space-y-6">
        {sortedGroups.map((group) => (
          <div key={group} className="term-group">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {group}
            </h3>
            <div className="space-y-2">
              {groupedTerms[group].map((term) => {
                const isCompleted = userCompletedTerms.includes(term.id);

                return (
                  <div
                    key={term.id}
                    className="flex items-center p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{term.term}</div>
                      {term.full_form && (
                        <div className="text-sm text-gray-500">
                          {term.full_form}
                        </div>
                      )}
                    </div>

                    {isCompleted ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermModuleList;
