import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  Lesson,
  getAllLessonSlugs,
  getLessonBySlug,
} from "../../utils/lessonService";
import MicrolearningPlatform from "../../components/MicrolearningPlatform";
import TermLearningModule from "../../components/TermLearningModule";
import {
  getAllTerms,
  getRequiredTermsForLesson,
  hasCompletedRequiredTerms,
} from "../../utils/glossaryService";
import {
  getUserProgress,
  updateUserCompletedTerms,
} from "../../utils/userProgressService";
import { GlossaryTerm } from "../../types/glossary";

type LessonPageProps = {
  lesson: Lesson;
};

const LessonPage: NextPage<LessonPageProps> = ({ lesson }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [requiredTerms, setRequiredTerms] = useState<GlossaryTerm[]>([]);
  const [userCompletedTerms, setUserCompletedTerms] = useState<string[]>([]);
  const [termsPrereqsMet, setTermsPrereqsMet] = useState(false);

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Fetch glossary terms and check prerequisites
  useEffect(() => {
    const checkPrerequisites = async () => {
      try {
        // Get all glossary terms
        const terms = getAllTerms();
        setGlossaryTerms(terms);

        // Get required terms for this lesson
        const required = getRequiredTermsForLesson(lesson);
        setRequiredTerms(required);

        // Get user progress (including completed terms)
        const userProgress = await getUserProgress();
        setUserCompletedTerms(userProgress.completedTerms || []);

        // Check if prerequisites are met
        const prereqsMet = hasCompletedRequiredTerms(
          userProgress.completedTerms || [],
          lesson
        );
        setTermsPrereqsMet(prereqsMet);

        setLoading(false);
      } catch (error) {
        console.error("Error checking prerequisites:", error);
        setLoading(false);
      }
    };

    checkPrerequisites();
  }, [lesson]);

  // Handle completing terms
  const handleTermsCompleted = async (completedTermIds: string[]) => {
    try {
      // Update user's completed terms
      const updatedTerms = [...userCompletedTerms, ...completedTermIds];
      await updateUserCompletedTerms(updatedTerms);

      // Update local state
      setUserCompletedTerms(updatedTerms);
      setTermsPrereqsMet(true);
    } catch (error) {
      console.error("Error updating completed terms:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Show term learning module if prerequisites aren't met
  if (!termsPrereqsMet && requiredTerms.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-sm font-medium text-blue-600 mb-1">
          Terms to know
        </div>
        <h1 className="text-2xl font-bold mb-2">Before you begin: Key Terms</h1>
        <p className="text-gray-600 mb-6">
          Let's make sure you understand these important terms before starting
          the lesson.
        </p>

        <TermLearningModule
          requiredTerms={requiredTerms}
          glossaryTerms={glossaryTerms}
          userLearnedTerms={userCompletedTerms}
          onTermsCompleted={handleTermsCompleted}
        />
      </div>
    );
  }

  return (
    <MicrolearningPlatform
      lesson={lesson}
      glossaryTerms={glossaryTerms}
      userCompletedTerms={userCompletedTerms}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllLessonSlugs();
  const paths = slugs.map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      lesson,
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
};

export default LessonPage;
