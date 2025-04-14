import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultsDisplay from '../components/quiz/ResultsDisplay';
import { calculateLearningStyle } from '../utils/calculateLearningStyle';
import { Button } from '../components/catalyst/button';
import { AnswerSelections, QuizData, LearningStyleResults } from '../types/quiz';
import quizData from '../data/learning-style.json'; // Import quiz data to map answers
import { decodeAnswersFromQuery } from '../utils/quizUrlUtils'; // Import from utils
import { useAuth } from '../hooks/useAuth'; // Import useAuth
import { LoginModal } from '../components/auth/LoginModal'; // Import LoginModal
import { Text } from '../components/catalyst/text'; // Import Text for status messages
import { ArrowPathIcon } from '@heroicons/react/20/solid'; // For loading spinner
import { generateLLMPrompt } from '../utils/promptUtils'; // Import the function

// Helper function to calculate scores from answers, incorporating priority weighting
const calculateScoresFromAnswers = (
  answers: AnswerSelections, 
  data: QuizData
) => {
     // Use floating point numbers for scores due to weighting
     const scoresInternal: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
     const questionMap = new Map(data.questions.map(q => [q.id, q]));

     Object.entries(answers).forEach(([questionIdStr, selectedOptionIds]) => {
       const questionId = parseInt(questionIdStr, 10);
       const question = questionMap.get(questionId);
       if (question) {
         // Iterate through the ORDERED selected option IDs
         selectedOptionIds.forEach((optionId, index) => { // Get index for priority
           const scoreType = optionId; // Option ID is the score type (A, B, C, D)
           if (scoreType && scoresInternal.hasOwnProperty(scoreType)) {
             let weight = 0;
             const priority = index; // 0-based index is the priority

             if (priority === 0) { // Priority 1
               weight = 2;
             } else if (priority === 1) { // Priority 2
               weight = 1;
             } else { // Priority 3+
               weight = 0.5;
             }
             
             scoresInternal[scoreType] += weight; // Add the weighted score
           }
         });
       }
     });
     // Ensure the returned object matches StyleCounts type EXACTLY
     // Round the scores before returning, as StyleCounts expects numbers (integers)
     // Although calculateLearningStyle handles floats, the type expects int. Let's round.
     return { 
        a: Math.round(scoresInternal['A'] ?? 0), 
        b: Math.round(scoresInternal['B'] ?? 0), 
        c: Math.round(scoresInternal['C'] ?? 0), 
        d: Math.round(scoresInternal['D'] ?? 0) 
     };
};

// Define payload type (matching backend spec)
interface QuizResultPayload {
  quizType: string;
  quizVersion: string;
  userId: string | null;
  scores: { a: number; b: number; c: number; d: number };
  results: LearningStyleResults;
  prioritizedAnswers: AnswerSelections;
  timestamp: string;
}

// Define localStorage key
const PENDING_RESULTS_KEY = 'pendingQuizResults';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, isLoading: isAuthLoading } = useAuth();
  const [data] = React.useState<QuizData>(quizData as QuizData);
  const [isCopied, setIsCopied] = useState(false);
  const [topic, setTopic] = useState<string>("How does quantum computing work"); // State for topic input
  const [finalPrompt, setFinalPrompt] = useState<string>(''); // State for the final, updated prompt
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for login modal
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'promptLogin'>('idle');

  // Decode answers from URL
  const answers = useMemo(() => decodeAnswersFromQuery(location.search), [location.search]);

  // Remove explicit type annotation for scores
  const scores = useMemo(() => calculateScoresFromAnswers(answers, data), [answers, data]);

  // Check if we have any valid answers submitted
  const hasValidAnswers = Object.keys(answers).length > 0;

  // Calculate learning style based on scores
  const results = useMemo(() => {
    if (hasValidAnswers) {
      // Add type guard for score check
      const hasScores = Object.values(scores).some((score): score is number => typeof score === 'number' && score > 0);
      if (hasScores) {
        return calculateLearningStyle(scores);
      }
    }
    return null;
  }, [scores, hasValidAnswers]);

  // Generate the BASE prompt string (with placeholder)
  const basePrompt = useMemo(() => {
    return results ? generateLLMPrompt(results) : 'Please complete the quiz to generate a learning prompt.';
  }, [results]);

  // Update the final prompt whenever the basePrompt or topic changes
  useEffect(() => {
    const placeholder = "[Insert your topic here]";
    // Use a specific regex targeting only the placeholder at the end
    const topicLineRegex = new RegExp(`(\\nTopic to explain: )${placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`);

    if (basePrompt && results) {
        const currentTopic = topic || placeholder; // Use placeholder if topic is empty
        const updatedPrompt = basePrompt.replace(topicLineRegex, `$1${currentTopic}`);
        setFinalPrompt(updatedPrompt);
    } else {
        setFinalPrompt(basePrompt); // Fallback if no results or base prompt
    }
  }, [basePrompt, topic, results]);

   // Handle topic input change (Passed down to ResultsDisplay)
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };

  // Handle copy to clipboard - now copies the finalPrompt state
  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt).then(() => { // Use finalPrompt
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  // Handle restart quiz (navigate to welcome page)
  const handleRestart = () => {
    navigate('/'); // Go back to welcome page
  };

  // Placeholder for the actual API call
  const saveQuizResultsAPI = useCallback(async (payload: QuizResultPayload): Promise<boolean> => {
      console.log("Attempting to save quiz results:", payload);
      setSaveStatus('saving');
      const apiUrl = import.meta.env.VITE_WORKER_API_URL;
      const endpoint = `${apiUrl}/api/results/submit`; // Use the generic endpoint

      try {
          // Enable the actual fetch call
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (token) { // Add auth header only if logged in (which it should be in this flow)
              headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(payload),
          });

          if (response.ok) {
              console.log("Quiz results saved successfully via ResultsPage.");
              setSaveStatus('saved');
              // Pending results shouldn't exist here, but check just in case?
              // if (localStorage.getItem(PENDING_RESULTS_KEY)) {
              //    try { localStorage.removeItem(PENDING_RESULTS_KEY); } catch (e) { console.error("Error clearing potentially stale pending results:", e); }
              // }
              return true;
          } else {
              console.error("Failed to save quiz results via ResultsPage:", response.status, await response.text());
              setSaveStatus('error');
              return false;
          }
          
         /* --- Remove Simulation --- 
         console.log("Simulating successful API save.");
         setSaveStatus('saved');
         if (localStorage.getItem(PENDING_RESULTS_KEY)) {
             try { localStorage.removeItem(PENDING_RESULTS_KEY); } catch (e) { console.error("Error clearing pending results:", e); }
         }
         return true;
         --- End Simulation --- */

      } catch (error) {
          console.error("Error calling save API:", error);
          setSaveStatus('error');
          return false;
      }
  }, [token]); // Depend on token for auth header logic

  // Effect to trigger automatic save for logged-in users
  useEffect(() => {
      if (results && user && token && saveStatus === 'idle' && !isAuthLoading) {
          console.log("User logged in, attempting automatic save...");
          const payload: QuizResultPayload = {
              quizType: "learning_style",
              quizVersion: data.version,
              userId: user.id,
              scores: scores,
              results: results,
              prioritizedAnswers: answers,
              timestamp: new Date().toISOString(),
          };
          saveQuizResultsAPI(payload);
      } else if (results && !token && saveStatus === 'idle' && !isAuthLoading) {
          // If results are ready, user is not logged in, and we haven't decided action yet
          console.log("User not logged in, prompting to save results.");
          setSaveStatus('promptLogin');
      }
  }, [results, user, token, saveStatus, isAuthLoading, data.version, scores, answers, saveQuizResultsAPI]);

  // Handler for the "Save Results" button (for non-logged-in users)
  const handlePromptSave = () => {
      if (!results) return; // Should not happen if button is visible, but safeguard

      const payload: Omit<QuizResultPayload, 'userId'> = {
          quizType: "learning_style",
          quizVersion: data.version,
          scores: scores,
          results: results,
          prioritizedAnswers: answers,
          timestamp: new Date().toISOString(),
      };
      try {
          localStorage.setItem(PENDING_RESULTS_KEY, JSON.stringify(payload));
          console.log("Pending results saved to localStorage.");
          setIsLoginModalOpen(true); // Open login modal
      } catch (e) {
           console.error("Error saving pending results to localStorage:", e);
           setSaveStatus('error'); // Show error if localStorage fails
      }
  };

  // If no valid results, show a message and link to start the quiz
  if (!hasValidAnswers || !results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Results Found</h1>
        <p className="mb-8">Complete the quiz to see your learning style!</p>
        {/* Use Button component for consistency */}
        <Button href="/" color="indigo"> 
          Start Quiz
        </Button>
      </div>
    );
  } else if (!results && isAuthLoading) {
      // Show loading indicator while auth is checked, potentially before results are ready
      return <div className="p-8 text-center">Loading Results...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ResultsDisplay 
        results={results} 
        finalPrompt={finalPrompt}
        topic={topic}
        handleTopicChange={handleTopicChange}
        handleCopy={handleCopy}
        isCopied={isCopied}
        saveStatus={saveStatus}
        isAuthLoading={isAuthLoading}
        onPromptSave={handlePromptSave}
      />

      <div className="mt-8 flex justify-center">
        {/* Use the handler for restart */}
        <Button outline onClick={handleRestart}>
          Take Quiz Again
        </Button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-1">
          Share your results by copying this URL:
        </p>
        <div className="flex justify-center">
          <div 
            className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md inline-block max-w-full overflow-x-auto whitespace-nowrap font-mono cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('URL copied to clipboard!');
            }}
            title="Click to copy URL"
          >
            {window.location.href}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default ResultsPage;