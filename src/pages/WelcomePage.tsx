import React from 'react';
import { Heading } from '../components/catalyst/heading';
import { Text } from '../components/catalyst/text';
import { Button } from '../components/catalyst/button';
import { PRIMARY_BUTTON_COLOR } from '../config/theme';

// No props needed for this simple page

const WelcomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <Heading level={1} className="mb-6 text-3xl sm:text-4xl">
        Learning Style Quiz
      </Heading>
      
      <Text className="mb-8 max-w-2xl mx-auto">
        Everyone learns differently! Take this quick quiz to discover your
        unique learning style and get personalized tips to improve your
        learning experience.
      </Text>
      
      <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
          <Heading level={3}>Visual</Heading>
          <Text>Learn through seeing and watching demonstrations</Text>
        </div>
        
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <Heading level={3}>Auditory</Heading>
          <Text>Learn through listening and speaking</Text>
        </div>
        
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
          <Heading level={3}>Reading/Writing</Heading>
          <Text>Learn through interaction with text</Text>
        </div>
        
        <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
          <Heading level={3}>Kinesthetic</Heading>
          <Text>Learn through hands-on experiences</Text>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          href="/quiz/1" 
          color={PRIMARY_BUTTON_COLOR} 
          className="text-lg px-6 py-3 shadow-md hover:shadow-lg transition-all"
        >
          Start Quiz Now
        </Button>
      </div>
      
      <Text className="mt-8">
        This quiz contains 5 questions and takes about 2 minutes to complete.
      </Text>
    </div>
  );
};

export default WelcomePage;