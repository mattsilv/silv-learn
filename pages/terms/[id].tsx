import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TermLearningModule from "../../components/TermLearningModule";
import { getAllTerms, getTermById } from "../../utils/glossaryService";
import {
  getUserProgress,
  updateUserCompletedTerms,
} from "../../utils/userProgressService";
import { GlossaryTerm } from "../../types/glossary";

type TermPageProps = {
  term: GlossaryTerm;
  allTerms: GlossaryTerm[];
};

const TermPage: NextPage<TermPageProps> = ({ term, allTerms }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userCompletedTerms, setUserCompletedTerms] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // If the page is not yet generated, this will be displayed
  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Fetch user progress
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const userProgress = await getUserProgress();
        const completedTerms = userProgress.completedTerms || [];
        setUserCompletedTerms(completedTerms);
        setIsCompleted(completedTerms.includes(term.id));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user progress:", error);
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [term.id]);

  // Handle completing terms
  const handleTermsCompleted = async (completedTermIds: string[]) => {
    try {
      // Update user's completed terms
      const updatedTerms = [...userCompletedTerms, ...completedTermIds];
      await updateUserCompletedTerms(updatedTerms);

      // Update local state
      setUserCompletedTerms(updatedTerms);
      setIsCompleted(true);

      // Show a success message
      alert("Term completed successfully!");

      // Redirect back to home after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{term.term} | silvlearn - Learning through microlessons</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        {isCompleted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              {term.term} - Completed!
            </h1>
            <p className="text-green-700">
              You've already completed this term. You can review it again or
              return to the homepage.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setIsCompleted(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Review Again
              </button>
            </div>
          </div>
        ) : (
          <TermLearningModule
            requiredTerms={[term]}
            glossaryTerms={allTerms}
            userLearnedTerms={userCompletedTerms}
            onTermsCompleted={handleTermsCompleted}
          />
        )}
      </div>
    </div>
  );
};

// Generate static paths for all terms
export const getStaticPaths: GetStaticPaths = async () => {
  const terms = getAllTerms();
  const paths = terms.map((term) => ({
    params: { id: term.id },
  }));

  return {
    paths,
    fallback: true,
  };
};

// Get the term data for the page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;
  const term = getTermById(id);
  const allTerms = getAllTerms();

  if (!term) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      term,
      allTerms,
    },
  };
};

export default TermPage;
