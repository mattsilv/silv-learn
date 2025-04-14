import { LearningStyleResults } from '../types/quiz';

// Define StyleResult type needed for processing
type StyleResult = {
  style: string;
  score: number;
  percentage: number;
  description: string;
};

// Function to generate the LLM prompt (moved from ResultsPage)
export const generateLLMPrompt = (results: LearningStyleResults): string => {
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
        prompt += `When explaining the topic below, please:\n\n`; 
        prompt += `1. Start with a brief overview using mixed modalities...\n`;
        prompt += `2. For complex concepts, present information in multiple formats:\n`;
        
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
        prompt += `When explaining the topic below, please:\n\n`; 
        
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
        
        if (secondaryStyles.length > 0) {
            prompt += `\nAdditionally, please incorporate some elements that support my secondary learning style(s):\n`;
            secondaryStyles.forEach(style => {
                if (style.percentage >= 15) { 
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
    
    prompt += `\nTopic to explain: ${topicPlaceholder}`;
    
    return prompt;
}; 