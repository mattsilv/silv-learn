import React from 'react';
import { Heading } from '../catalyst/heading';
import { Text } from '../catalyst/text';
import { LearningStyleResults } from '../../types/quiz';
import { Textarea } from '../catalyst/textarea';
import { Field, Label } from '../catalyst/fieldset';
import { Button } from '../catalyst/button';
import { ClipboardDocumentIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';

interface ResultsDisplayProps {
  results: LearningStyleResults;
  llmPrompt: string;
  handleCopy: () => void;
  isCopied: boolean;
}

// Define type for individual result items
type StyleResult = LearningStyleResults[keyof Omit<LearningStyleResults, 'multimodal'>];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  llmPrompt, 
  handleCopy, 
  isCopied 
}) => {
  // Sort non-multimodal results by score (highest first)
  const sortedStyles: StyleResult[] = Object.values(results)
    .filter((r): r is StyleResult => !!r && r.style !== 'Multimodal')
    .sort((a, b) => b.score - a.score);

  // Get the single highest scoring style
  const topStyle = sortedStyles[0]; 

  // Check if multimodal was triggered (multiple styles close to top)
  const hasMultimodal = 'multimodal' in results;

  // Get all styles including multimodal for the breakdown list
  const allStylesForBreakdown = Object.values(results)
    .filter(r => !!r && !isNaN(r.percentage))
    .sort((a, b) => b.score - a.score); // Sort by score for display order

  if (!topStyle) { // Handle edge case where no styles scored
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-3xl mx-auto text-center">
        <Heading level={1} className="mb-4">No results to display.</Heading>
        <Text>Please complete the quiz.</Text>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
      <Heading level={1} className="text-center mb-6">
        Your Learning Style Results
      </Heading>
      
      {/* Primary result highlight - Always show the top style */}
      <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <Heading level={2} className="mb-3">
          {/* Headline always focuses on the top style */}
          You lean towards being a {topStyle.style} Learner
        </Heading>
        <Text className="mb-2">
          {topStyle.description}
        </Text>
        {/* Add note if multimodal */}
        {hasMultimodal && (
          <Text className="text-sm text-indigo-800 dark:text-indigo-300 italic">
            (You have a balanced profile with other strong styles too! See breakdown below.)
          </Text>
        )}
      </div>
      
      {/* Results breakdown - Use allStylesForBreakdown */}
      <Heading level={3} className="mb-4">
        Style Breakdown
      </Heading>
      
      {allStylesForBreakdown.map((result) => (
        <div key={result.style} className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">
              <Text>{result.style}</Text>
            </span>
            <span>
              <Text>{result.percentage}%</Text>
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500"
              style={{ width: `${result.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
      
      {/* Learning Tips and LLM Prompt Section (Combined) */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
        <Heading level={3} className="mb-2">
          Tips for Your Learning Style ({topStyle.style})
        </Heading>
        <div className="space-y-2 mb-6">
          {topStyle.style === 'Visual' && (
            <>
              <Text>• Use charts, diagrams, and mind maps</Text>
              <Text>• Highlight key points with different colors</Text>
              <Text>• Watch videos and demonstrations</Text>
              <Text>• Visualize concepts in your mind</Text>
            </>
          )}
          {topStyle.style === 'Auditory' && (
            <>
              <Text>• Record lectures and listen to them again</Text>
              <Text>• Discuss topics with others</Text>
              <Text>• Read material aloud to yourself</Text>
              <Text>• Use mnemonic devices and rhymes</Text>
            </>
          )}
          {topStyle.style === 'Reading/Writing' && (
            <>
              <Text>• Take detailed notes and rewrite them</Text>
              <Text>• Create lists and outlines</Text>
              <Text>• Restate concepts in your own words</Text>
              <Text>• Use textbooks and written resources</Text>
            </>
          )}
          {topStyle.style === 'Kinesthetic' && (
            <>
              <Text>• Practice hands-on activities</Text>
              <Text>• Use physical objects when learning</Text>
              <Text>• Take breaks and move around</Text>
              <Text>• Role-play scenarios</Text>
            </>
          )}
        </div>

        <Field className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
          <Label className="mb-2 font-medium">Your Personalized Learning Prompt for LLMs:</Label>
          <div className="mt-1">
            <Textarea 
              readOnly 
              value={llmPrompt} 
              rows={6}
              className="p-3 text-xs" 
            />
          </div>
          <div className="mt-3 flex justify-center">
            <Button 
              color="indigo" 
              onClick={handleCopy} 
              aria-label="Copy prompt"
              className="inline-flex items-center rounded px-3 py-1.5 text-sm font-semibold shadow-sm"
            >
              <ClipboardDocumentIcon className="-ml-0.5 mr-1.5 size-5" />
              <span>
                {isCopied ? 'Copied!' : 'Copy Prompt'}
              </span>
            </Button>
          </div>
        </Field>
      </div>
    </div>
  );
};

export default ResultsDisplay;