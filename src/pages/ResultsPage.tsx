import React, { useMemo, useState, useEffect } from 'react';
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
    const hasMultimodal = results.multimodal !== undefined;
    const sortedStyles = Object.values(results)
        .filter((r): r is StyleResult => 
            !!r && typeof r === 'object' && 'style' in r && r.style !== 'Multimodal' && !isNaN(r.percentage) && r.percentage > 0
        )
        .sort((a, b) => b.percentage - a.percentage);

    if (sortedStyles.length === 0) {
        return "No specific learning style preferences detected.";
    }

    const styleList = sortedStyles.map((style, index) => 
        `${index + 1}. ${style.style} (${style.percentage}%): ${style.description}`
    ).join('\n');

    // Define the placeholder just once for the end
    const topicPlaceholder = "[Insert your topic here]"; 

    let prompt = `My learning style assessment results:\n\n${styleList}\n\n`;
    
    if (hasMultimodal) {
        prompt += `I have a multimodal learning preference with strengths in multiple areas. ${results.multimodal!.description}\n\n`;
        // Modify instruction line - remove placeholder
        prompt += `When explaining the topic below, please:\n\n`; 
        prompt += `1. Start with a brief overview using mixed modalities...\n`;
        prompt += `2. For complex concepts, present information in multiple formats:\n`;
        
        // Add specific strategies for each of their top styles
        sortedStyles.slice(0, 2).forEach(style => {
            if (style.style === 'Visual') {
                prompt += `   - Include visual metaphors, diagrams, or mental imagery I can visualize\n`;
            } else if (style.style === 'Auditory') {
                prompt += `   - Frame explanations conversationally as if we're discussing the topic\n`;
            } else if (style.style === 'Reading/Writing') {
                prompt += `   - Provide clear, well-structured explanations with key points emphasized\n`;
            } else if (style.style === 'Kinesthetic') {
                prompt += `   - Include practical examples, interactive thought experiments, or analogies to physical experiences\n`;
            }
        });
        
        prompt += `3. Connect new information to practical applications and real-world contexts\n`;
        prompt += `4. Summarize key points at the end using multiple approaches\n\n`;
    } else {
        const primaryStyle = sortedStyles[0];
        const secondaryStyles = sortedStyles.slice(1, 3);
        prompt += `My primary learning style is ${primaryStyle.style} (${primaryStyle.percentage}%).\n\n`;
        // Modify instruction line - remove placeholder
        prompt += `When explaining the topic below, please:\n\n`; 
        
        // Add specific strategies for their primary style
        if (primaryStyle.style === 'Visual') {
            prompt += `1. Use rich visual descriptions, metaphors, and imagery I can visualize\n`;
            prompt += `2. Describe diagrams, charts, or visual relationships between concepts\n`;
            prompt += `3. Organize information with clear visual structure (hierarchies, sequences, relationships)\n`;
        } else if (primaryStyle.style === 'Auditory') {
            prompt += `1. Use a conversational tone as if we're discussing the topic verbally\n`;
            prompt += `2. Explain concepts through analogies, stories, and verbal examples\n`;
            prompt += `3. Repeat key points in different ways to reinforce auditory processing\n`;
        } else if (primaryStyle.style === 'Reading/Writing') {
            prompt += `1. Provide well-structured, logical explanations with clear terminology\n`;
            prompt += `2. Present information in organized lists, paragraphs, and sections\n`;
            prompt += `3. Define terms precisely and use written explanations rather than analogies\n`;
        } else if (primaryStyle.style === 'Kinesthetic') {
            prompt += `1. Include practical examples and real-world applications\n`;
            prompt += `2. Use interactive thought experiments that let me mentally "do" something\n`;
            prompt += `3. Connect concepts to physical experiences or hands-on activities\n`;
        }
        
        // Add supplementary approaches if they have secondary styles
        if (secondaryStyles.length > 0) {
            prompt += `\nAdditionally, please incorporate some elements that support my secondary learning style(s):\n`;
            secondaryStyles.forEach(style => {
                if (style.percentage >= 15) { // Only include meaningful secondary styles
                    prompt += `- ${style.style} (${style.percentage}%): `;
                    
                    if (style.style === 'Visual') {
                        prompt += `Include some visual descriptions or spatial relationships\n`;
                    } else if (style.style === 'Auditory') {
                        prompt += `Include some conversational elements or verbal explanations\n`;
                    } else if (style.style === 'Reading/Writing') {
                        prompt += `Include some structured text explanations or defined terminology\n`;
                    } else if (style.style === 'Kinesthetic') {
                        prompt += `Include some practical applications or interactive elements\n`;
                    }
                }
            });
        }
    }
    
    // Append the placeholder only at the very end
    prompt += `\nTopic to explain: ${topicPlaceholder}`;
    
    return prompt;
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data] = React.useState<QuizData>(quizData as QuizData);
  const [isCopied, setIsCopied] = useState(false);
  const [topic, setTopic] = useState<string>("How does quantum computing work"); // State for topic input
  const [finalPrompt, setFinalPrompt] = useState<string>(''); // State for the final, updated prompt

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
        finalPrompt={finalPrompt}
        topic={topic}
        handleTopicChange={handleTopicChange}
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
    </div>
  );
};

export default ResultsPage;