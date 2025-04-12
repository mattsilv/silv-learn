import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultsDisplay from '../components/quiz/ResultsDisplay';
import { calculateLearningStyle } from '../utils/calculateLearningStyle';
import { Button } from '../components/catalyst/button';
import { AnswerSelections, QuizData, LearningStyleResults } from '../types/quiz';
import quizData from '../data/learning-style.json'; // Import quiz data to map answers

// Helper function (can be moved to utils if preferred)
const decodeAnswersFromQuery = (queryString: string): AnswerSelections => {
  const params = new URLSearchParams(queryString);
  const decodedAnswers: AnswerSelections = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith('q')) {
      const questionId = parseInt(key.substring(1), 10);
      if (!isNaN(questionId) && value) {
        decodedAnswers[questionId] = value.split(',');
      }
    }
  }
  return decodedAnswers;
};

// Helper function to calculate scores from answers
const calculateScoresFromAnswers = (
  answers: AnswerSelections, 
  data: QuizData
) => {
     const scoresInternal: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
     const questionMap = new Map(data.questions.map(q => [q.id, q]));

     Object.entries(answers).forEach(([questionIdStr, selectedOptionIds]) => {
       const questionId = parseInt(questionIdStr, 10);
       const question = questionMap.get(questionId);
       if (question) {
         selectedOptionIds.forEach(optionId => {
           const scoreType = optionId; // Option ID is the score type (A, B, C, D)
           if (scoreType && scoresInternal.hasOwnProperty(scoreType)) {
             scoresInternal[scoreType]++;
           }
         });
       }
     });
     // Ensure the returned object matches StyleCounts type EXACTLY
     return { 
        a: scoresInternal['A'] ?? 0, 
        b: scoresInternal['B'] ?? 0, 
        c: scoresInternal['C'] ?? 0, 
        d: scoresInternal['D'] ?? 0 
     };
};

// Define type for individual result items derived from LearningStyleResults
type StyleResult = {
  style: string;
  score: number;
  percentage: number;
  description: string;
};

// Function to generate the LLM prompt
const generateLLMPrompt = (results: LearningStyleResults): string => {
    // Filter out non-styles and multimodal if present, then sort by percentage
    const sortedStyles = Object.values(results)
        .filter((r): r is StyleResult => 
            !!r && 
            typeof r === 'object' && 
            'style' in r && 
            r.style !== 'Multimodal' && 
            !isNaN(r.percentage) && 
            r.percentage > 0 // Only include styles with a score > 0%
        )
        .sort((a, b) => b.percentage - a.percentage);

    if (sortedStyles.length === 0) {
        return "No specific learning style preferences detected from the assessment.";
    }

    const styleList = sortedStyles.map((style, index) => 
        `${index + 1}. ${style.style} (${style.percentage}%): ${style.description}`
    ).join('\n'); // Use \n for newlines in the prompt text

    const specificTopic = "how generative AI in chat works"; // Define the specific topic

    const prompt = `My learning profile based on a recent assessment suggests the following preferences, ranked by strength:\n\n${styleList}\n\nPlease explain the topic primarily using methods suited for the top style (${sortedStyles[0].style}). Where appropriate, also incorporate techniques beneficial for the secondary style(s) listed, adapting the explanation to leverage multiple modalities based on this ranking. Focus on optimizing the explanation for my learning style(s).\n\nTopic: ${specificTopic}`;

    return prompt;
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data] = React.useState<QuizData>(quizData as QuizData);
  const [isCopied, setIsCopied] = useState(false);

  // Decode answers from URL
  const answers = useMemo(() => decodeAnswersFromQuery(location.search), [location.search]);

  // Remove explicit type annotation for scores
  const scores = useMemo(() => calculateScoresFromAnswers(answers, data), [answers, data]);

  // Check if we have any valid answers submitted
  const hasValidAnswers = Object.keys(answers).length > 0;

  // Calculate learning style based on scores
  const results = useMemo(() => {
    if (hasValidAnswers) {
      const hasScores = Object.values(scores).some(score => score > 0);
      if (hasScores) {
        return calculateLearningStyle(scores);
      }
    }
    return null;
  }, [scores, hasValidAnswers]);

  // Generate the prompt string using the updated function
  const llmPrompt = useMemo(() => {
    return results ? generateLLMPrompt(results) : 'Please complete the quiz to generate a learning prompt.';
  }, [results]);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(llmPrompt).then(() => {
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
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ResultsDisplay 
        results={results} 
        llmPrompt={llmPrompt}
        handleCopy={handleCopy}
        isCopied={isCopied}
      />

      <div className="mt-8 flex justify-center">
        {/* Use the handler for restart */}
        <Button outline onClick={handleRestart}>
          Take Quiz Again
        </Button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Share your results by copying this URL
        </p>
        {/* Optional: Add a button to copy URL */}
      </div>
    </div>
  );
};

export default ResultsPage;