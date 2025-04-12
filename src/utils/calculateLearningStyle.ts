import { LearningStyleResults } from '../types/quiz';

interface StyleCounts {
  a: number;
  b: number;
  c: number;
  d: number;
}

export function calculateLearningStyle(
  counts: StyleCounts
): LearningStyleResults {
  const total = counts.a + counts.b + counts.c + counts.d;
  
  // Handle the case when there are no answers (all counts are zero)
  if (total === 0) {
    return {
      visual: {
        style: 'Visual',
        description: 'You learn best through seeing and visualizing information. Use diagrams, charts, images, and color-coding to enhance your learning.',
        score: 0,
        percentage: NaN
      },
      auditory: {
        style: 'Auditory',
        description: 'You learn best through listening and verbal communication. Consider recording lessons, discussing topics, or reading aloud.',
        score: 0,
        percentage: NaN
      },
      reading: {
        style: 'Reading/Writing',
        description: 'You learn best through reading and writing information. Make lists, take detailed notes, and rewrite information in your own words.',
        score: 0,
        percentage: NaN
      },
      kinesthetic: {
        style: 'Kinesthetic',
        description: 'You learn best through hands-on activities and physical movement. Try practical exercises, role-playing, and physical engagement with material.',
        score: 0,
        percentage: NaN
      }
    };
  }
  
  const results: LearningStyleResults = {
    visual: {
      style: 'Visual',
      description: 'You learn best through seeing and visualizing information. Use diagrams, charts, images, and color-coding to enhance your learning.',
      score: counts.a,
      percentage: Math.round((counts.a / total) * 100)
    },
    auditory: {
      style: 'Auditory',
      description: 'You learn best through listening and verbal communication. Consider recording lessons, discussing topics, or reading aloud.',
      score: counts.b,
      percentage: Math.round((counts.b / total) * 100)
    },
    reading: {
      style: 'Reading/Writing',
      description: 'You learn best through reading and writing information. Make lists, take detailed notes, and rewrite information in your own words.',
      score: counts.c,
      percentage: Math.round((counts.c / total) * 100)
    },
    kinesthetic: {
      style: 'Kinesthetic',
      description: 'You learn best through hands-on activities and physical movement. Try practical exercises, role-playing, and physical engagement with material.',
      score: counts.d,
      percentage: Math.round((counts.d / total) * 100)
    }
  };
  
  // Sort results by score to determine primary style
  const sortedResults = Object.values(results).sort((a, b) => b.score - a.score);
  const highestScore = sortedResults[0].score;
  
  // Check if the person is multimodal
  const topStyles = sortedResults.filter(
    result => result.score === highestScore || result.score >= highestScore - 1
  );
  
  // If multiple styles have the same or similar score, add multimodal result
  if (topStyles.length > 1 && highestScore > 0) {
    const stylesString = topStyles.map(style => style.style).join(', ');
    results.multimodal = {
      style: 'Multimodal',
      description: `You have a balanced learning style across multiple approaches: ${stylesString}. This flexibility allows you to adapt to different teaching methods.`,
      score: Math.max(...topStyles.map(style => style.score)),
      percentage: Math.round((topStyles.reduce((sum, style) => sum + style.score, 0) / (topStyles.length * total)) * 100)
    };
  }
  
  return results;
}