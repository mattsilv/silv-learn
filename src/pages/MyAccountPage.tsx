import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heading } from '../components/catalyst/heading';
import { Text } from '../components/catalyst/text';
import { Button } from '../components/catalyst/button';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '../components/catalyst/description-list';
import { Badge } from '../components/catalyst/badge';
import { ArrowPathIcon } from '@heroicons/react/20/solid';
import { LearningStyleResults, AnswerSelections } from '../types/quiz';
import { encodeAnswersToQuery } from '../utils/quizUrlUtils';
import { generateLLMPrompt } from '../utils/promptUtils';
import { Field, Label } from '../components/catalyst/fieldset';
import { Textarea } from '../components/catalyst/textarea';
import { formatRelativeTime, formatAbsoluteTime } from '../utils/timeUtils';

// Define the expected payload structure from the API (MATCHING BACKEND SNAKE_CASE)
interface SavedResult {
    id?: string; // Include ID potentially
    user_id?: string; // Include user_id potentially
    quiz_type: string;           // Use snake_case
    quiz_version: string;        // Use snake_case
    scores: { a: number; b: number; c: number; d: number };
    results: LearningStyleResults; 
    prioritized_answers: AnswerSelections; // Use snake_case
    submitted_at: string;          // Use snake_case
}

// Helper type for displaying sorted styles
type StyleInfo = { name: string; score: number; percentage: number };

const MyAccountPage: React.FC = () => {
  const { token, user, isLoading: isAuthLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [savedResults, setSavedResults] = useState<SavedResult | null>(null);
  const [isResultsLoading, setIsResultsLoading] = useState<boolean>(true);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [isAccountPromptCopied, setIsAccountPromptCopied] = useState(false);
  const [accountPrompt, setAccountPrompt] = useState('');

  // Simulate fetching latest results
  useEffect(() => {
    const fetchLatestResults = async () => {
      if (!token) { // Don't fetch if not logged in
        setIsResultsLoading(false);
        return;
      }
      
      setIsResultsLoading(true);
      setResultsError(null);
      console.log("Fetching latest learning style results...");
      const apiUrl = import.meta.env.VITE_WORKER_API_URL;
      const endpoint = `${apiUrl}/api/results/latest?quizType=learning_style`;

      try {
        // Enable the actual fetch call
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data: SavedResult = await response.json();
          setSavedResults(data);
          console.log("Fetched results:", data);
        } else if (response.status === 404) {
          console.log("No saved learning style results found for user.");
          setSavedResults(null); // Explicitly set to null
        } else {
          // Throw error for other non-ok statuses (like 401, 400, 500)
          throw new Error(`Failed to fetch results: ${response.status}`);
        }
        
      } catch (error) {
        console.error("Error fetching results:", error);
        setResultsError("Could not load saved learning style.");
        setSavedResults(null);
      } finally {
        setIsResultsLoading(false);
      }
    };

    // Only fetch if auth is loaded and token exists
    if (!isAuthLoading && token) {
      fetchLatestResults();
    } else if (!isAuthLoading && !token) {
        // If auth loaded and no token, no results to fetch
        setIsResultsLoading(false);
    }
  }, [token, isAuthLoading]);

  // Process results for display
  const displayStyles = useMemo((): StyleInfo[] => {
      if (!savedResults?.results) return [];
      
      return Object.values(savedResults.results)
          .filter(r => r.style !== 'Multimodal' && r.score > 0)
          .map(r => ({ name: r.style, score: r.score, percentage: r.percentage }))
          .sort((a, b) => b.score - a.score); // Sort by score desc
  }, [savedResults]);

  const isMultimodal = useMemo(() => !!savedResults?.results?.multimodal, [savedResults]);
  const primaryStyle = displayStyles[0];
  const secondaryStyles = displayStyles.slice(1);

  // --- Calculate quiz URL with saved answers --- 
  const quizUrl = useMemo(() => {
      // Access using snake_case
      if (savedResults?.prioritized_answers && Object.keys(savedResults.prioritized_answers).length > 0) {
          return `/quiz/1${encodeAnswersToQuery(savedResults.prioritized_answers)}`;
      }
      return '/quiz/1'; 
  }, [savedResults?.prioritized_answers]); // Depend on snake_case field

  // --- Generate prompt when results load ---
  useEffect(() => {
      if (savedResults?.results) {
          const basePrompt = generateLLMPrompt(savedResults.results);
          const defaultTopic = "How does quantum computing work"; // Default topic
          const placeholder = "[Insert your topic here]";
          const topicLineRegex = new RegExp(`(\\nTopic to explain: )${placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`);
          const finalPrompt = basePrompt.replace(topicLineRegex, `$1${defaultTopic}`);
          setAccountPrompt(finalPrompt);
      } else {
          setAccountPrompt(''); // Clear if no results
      }
  }, [savedResults]);

  // --- Calculate formatted times --- 
  const relativeTimestamp = useMemo(() => {
      console.log('[MyAccountPage] Timestamp for relative format:', savedResults?.submitted_at);
      // Use snake_case field
      return savedResults?.submitted_at ? formatRelativeTime(savedResults.submitted_at) : '...';
  }, [savedResults?.submitted_at]); // Depend on snake_case field

  const absoluteTimestamp = useMemo(() => {
       console.log('[MyAccountPage] Timestamp for absolute format:', savedResults?.submitted_at);
       // Use snake_case field
       return savedResults?.submitted_at ? formatAbsoluteTime(savedResults.submitted_at) : 'Unknown date';
  }, [savedResults?.submitted_at]); // Depend on snake_case field

  // --- Copy handler ---
  const handleAccountCopyPrompt = () => {
      if (!accountPrompt) return;
      navigator.clipboard.writeText(accountPrompt).then(() => {
          setIsAccountPromptCopied(true);
          setTimeout(() => setIsAccountPromptCopied(false), 2000);
      }).catch(err => {
          console.error('Failed to copy prompt from account page: ', err);
      });
  };

  // --- Render Logic --- 

  // Redirect if definitely logged out (and not just loading auth state)
  if (!isAuthLoading && !token) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Heading level={2} className="mb-6 text-center">My Account</Heading>
      
      {/* User Info Section */}    
      <div className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
        <Heading level={3} className="mb-4 text-lg font-medium">User Information</Heading>
        {isAuthLoading ? (
          <Text className="italic text-gray-500">Loading user info...</Text>
        ) : user ? (
          <DescriptionList>
            {user.name && (
                 <><DescriptionTerm>Name</DescriptionTerm><DescriptionDetails>{user.name}</DescriptionDetails></>
            )}
            <DescriptionTerm>Email</DescriptionTerm>
            <DescriptionDetails>{user.email}</DescriptionDetails>
            <DescriptionTerm>User ID</DescriptionTerm>
            <DescriptionDetails className="font-mono text-xs">{user.id}</DescriptionDetails>
          </DescriptionList>
        ) : (
          <Text className="text-red-600">Could not load user information.</Text>
        )}
      </div>

      {/* Learning Style Section */}    
      <div className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm min-h-[150px]">
        <Heading level={3} className="mb-4 text-lg font-medium">Your Learning Style</Heading>
        {isResultsLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <ArrowPathIcon className="size-5 animate-spin" />
                <Text>Loading saved learning style...</Text>
            </div>
        ) : resultsError ? (
            <Text className="text-red-600 dark:text-red-400">{resultsError}</Text>
        ) : savedResults && primaryStyle ? (
            <div>
                {isMultimodal && (
                    <Badge color="teal" className="mb-3 inline-flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                           <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.463l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.795 2.48.853 3.681a.75.75 0 0 1-1.12.814L8 12.39l-3.131 1.8a.75.75 0 0 1-1.12-.814l.852-3.68-2.795-2.48a.75.75 0 0 1 .428-1.318l3.665-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                        </svg>
                        Multimodal Learner
                    </Badge>
                )}
                <Text className="text-xl font-semibold mb-1">Primary: {primaryStyle.name} ({primaryStyle.percentage}%)</Text>
                {savedResults.results[primaryStyle.name.toLowerCase()]?.description && (
                     <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">{savedResults.results[primaryStyle.name.toLowerCase()]?.description}</Text>
                )}
                
                {secondaryStyles.length > 0 && (
                     <div className="mt-4 border-t pt-4">
                          <Text className="text-base font-medium mb-2">Secondary Styles:</Text>
                          <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                               {secondaryStyles.map(style => (
                                   <li key={style.name}>{style.name} ({style.percentage}%)</li>
                               ))}
                          </ul>
                     </div>
                )}
                
                {/* --- Added Prompt Display and Copy Button --- */}    
                {accountPrompt && (
                  <Field className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
                    <Label htmlFor="account-llm-prompt" className="text-base font-medium mb-2">
                        Personalized AI Learning Prompt
                    </Label>
                    <Textarea
                      id="account-llm-prompt"
                      readOnly
                      value={accountPrompt}
                      rows={10} // Slightly fewer rows maybe
                      className="p-3 text-[0.8rem] leading-relaxed"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <div className="mt-3 flex justify-center">
                      <Button 
                        color="indigo" 
                        onClick={handleAccountCopyPrompt}
                        aria-label="Copy prompt"
                        className="inline-flex items-center justify-center rounded px-3 py-1.5 text-sm font-semibold shadow-sm"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {/* Re-use copy icon */}   
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-y-[0.5px]">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                          {isAccountPromptCopied ? 'Copied!' : 'Copy Prompt'}
                        </span>
                      </Button>
                    </div>
                  </Field>
                )}
                {/* --- End Prompt Display --- */} 

                {/* --- Updated Last Updated / Retake Section --- */}
                <div className="mt-4 flex items-center justify-between gap-4">
                    <Text 
                        className="text-xs text-gray-400 dark:text-gray-500"
                        title={absoluteTimestamp}
                     >
                         Last updated: {relativeTimestamp}
                    </Text>
                    <Button 
                        href={quizUrl} 
                        plain 
                        className="text-xs underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                        Retake quiz to update?
                    </Button>
                </div>
                {/* --- End Updated Section --- */}
            </div>
        ) : (
            <div className="text-center">
                <Text className="mb-4">You haven't saved your learning style yet.</Text>
                <Button href="/quiz/1" color="indigo">
                    Take the Learning Style Quiz
                </Button>
            </div>
        )}
      </div>

      {/* Logout Button */} 
      <div className="text-center">
          <Button color="light" onClick={handleLogout} className="w-full sm:w-auto">
            Logout
          </Button>
      </div>
    </div>
  );
};

export default MyAccountPage; 