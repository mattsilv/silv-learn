import React, { useState, useEffect } from 'react';
import { Heading } from '../catalyst/heading';
import { Text } from '../catalyst/text';
import { LearningStyleResults } from '../../types/quiz';
import { Textarea } from '../catalyst/textarea';
import { Field, Label } from '../catalyst/fieldset';
import { Button } from '../catalyst/button';
import { Input } from '../catalyst/input';

interface ResultsDisplayProps {
  results: LearningStyleResults;
  llmPrompt: string;
  handleCopy: () => void;
  isCopied: boolean;
}

// Define type for individual result items
type StyleResult = LearningStyleResults[keyof Omit<LearningStyleResults, 'multimodal'>]; // Test comment

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  llmPrompt: originalPrompt, 
  handleCopy, 
  isCopied 
}) => {
  const [topic, setTopic] = useState<string>("How does quantum computing work");
  const [llmPrompt, setLlmPrompt] = useState<string>(originalPrompt);
  
  // Update the prompt when topic changes
  useEffect(() => {
    // Replace all instances of "[Insert your topic here]" with the actual topic
    const updatedPrompt = originalPrompt.replace(/\[Insert your topic here\]/g, topic);
    setLlmPrompt(updatedPrompt);
  }, [topic, originalPrompt]);
  
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
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
        <ul className="list-disc pl-5 space-y-2 text-zinc-500 dark:text-zinc-400 text-base sm:text-sm">
          {topStyle.style === 'Visual' && (
            <>
              <li>Create mind maps and visual diagrams to represent complex concepts</li>
              <li>Use color-coding for notes, highlighting key information in different colors</li>
              <li>Watch instructional videos with demonstrations instead of just reading</li>
              <li>Convert information into charts, timelines, and infographics</li>
              <li>Use visual analogies and create mental pictures when learning new ideas</li>
              <li>Try sitting at the front of class/meetings to see presentations clearly</li>
            </>
          )}
          {topStyle.style === 'Auditory' && (
            <>
              <li>Record lectures/explanations and listen to them while commuting</li>
              <li>Join study groups to verbally discuss and explain concepts</li>
              <li>Read important material aloud, especially when reviewing</li>
              <li>Use podcasts and audiobooks when available</li>
              <li>Create songs, rhymes, or mnemonic devices for key information</li>
              <li>Explain concepts to others to reinforce your understanding</li>
            </>
          )}
          {topStyle.style === 'Reading/Writing' && (
            <>
              <li>Rewrite notes in your own words to reinforce comprehension</li>
              <li>Organize information using outlines, lists, and structured formats</li>
              <li>Create written summaries after learning sessions</li>
              <li>Use multiple text sources to understand different perspectives</li>
              <li>Keep a learning journal to document insights and questions</li>
              <li>Convert diagrams and lectures into written descriptions</li>
            </>
          )}
          {topStyle.style === 'Kinesthetic' && (
            <>
              <li>Learn through practical projects and hands-on experiments</li>
              <li>Create physical models or use manipulatives when possible</li>
              <li>Take short, active breaks when studying (5 min every 25-30 min)</li>
              <li>Use simulations, role-playing, and real-world applications</li>
              <li>Try standing or moving while reviewing information</li>
              <li>Apply new knowledge immediately through practical exercises</li>
            </>
          )}
        </ul>
        
        {/* Multimodal tips section with proper heading and separated list */}
        {hasMultimodal && 'multimodal' in results && (
          <>
            <Heading level={4} className="mt-6 mb-2">
              Multimodal Learning Tips
            </Heading>
            <ul className="list-disc pl-5 space-y-2 mb-6 text-zinc-500 dark:text-zinc-400 text-base sm:text-sm">
              <li>Combine strategies from your strongest styles for comprehensive learning</li>
              <li>Adapt your approach based on the specific material you're studying</li>
              <li>Create learning experiences that engage multiple senses simultaneously</li>
              <li>Recognize which learning modes work best for different types of content</li>
            </ul>
          </>
        )}

        <Field className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
          <Heading level={3} className="mb-2">
            Your Personalized Learning Prompt for AI Assistants
          </Heading>
          <Text className="text-sm mb-2">
            Customize your prompt by entering a topic below. Copy the prompt and paste it to an AI assistant like Claude or ChatGPT to get an explanation tailored to your learning style!
          </Text>
          
          <div className="mb-3">
            <Label htmlFor="topic-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              What would you like to learn about?
            </Label>
            <span className="flex">
              <Input
                id="topic-input"
                type="text"
                value={topic}
                onChange={handleTopicChange}
                placeholder="Enter your topic here"
                style={{
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  height: '3.25rem'
                }}
                className="w-full"
              />
            </span>
          </div>
          
          <div className="mt-3">
            <Label htmlFor="customized-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Customized AI Learning Prompt
            </Label>
            <Textarea 
              id="customized-prompt"
              readOnly 
              value={llmPrompt} 
              rows={14}
              style={{ 
                padding: '0.75rem',
                fontSize: '0.6rem',
                lineHeight: '1.5',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <div className="mt-3 flex justify-center">
            <Button 
              color="indigo" 
              onClick={handleCopy} 
              aria-label="Copy prompt"
              className="inline-flex items-center justify-center rounded px-3 py-1.5 text-sm font-semibold shadow-sm"
            >
              <span className="inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-y-[0.5px]">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
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