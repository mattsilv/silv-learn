import { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { Book, CheckCircle, BookOpen } from "lucide-react";
import { getAllLessons } from "../utils/lessonService";
import type { Lesson } from "../utils/lessonService";
import { getAllTerms } from "../utils/glossaryService";
import { getUserProgress } from "../utils/userProgressService";
import { useState, useEffect } from "react";
import { GlossaryTerm } from "../types/glossary";

type HomeProps = {
  lessons: Lesson[];
};

const Home: NextPage<HomeProps> = ({ lessons }) => {
  const [userCompletedTerms, setUserCompletedTerms] = useState<string[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get all glossary terms
        const terms = getAllTerms();
        setGlossaryTerms(terms);

        // Get user progress
        const userProgress = await getUserProgress();
        setUserCompletedTerms(userProgress.completedTerms || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get term display name by ID
  const getTermNameById = (termId: string): string => {
    const term = glossaryTerms.find((t) => t.id === termId);
    return term ? term.term : termId;
  };

  // Group terms by first letter
  const groupTermsByFirstLetter = () => {
    const grouped: { [key: string]: GlossaryTerm[] } = {};

    glossaryTerms.forEach((term) => {
      const firstLetter = term.term.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(term);
    });

    return grouped;
  };

  const groupedTerms = !loading ? groupTermsByFirstLetter() : {};
  const sortedLetters = Object.keys(groupedTerms).sort();

  return (
    <>
      <Head>
        <title>MicroLearn - Interactive Learning Platform</title>
        <meta name="description" content="Interactive microlearning platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3">
                  <Book size={20} />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Micro<span className="text-blue-600">Learn</span>
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Available Lessons
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {lessons.map((lesson) => {
                return (
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    key={lesson.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {lesson.title}
                      </h2>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="bg-blue-100 rounded-full px-2 py-1 text-xs font-medium text-blue-800">
                            {lesson.duration_minutes} min
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {lesson.metadata.difficulty_level}
                        </div>
                      </div>

                      {!loading &&
                        lesson.required_terms &&
                        lesson.required_terms.length > 0 && (
                          <div className="mt-4 border-t pt-3">
                            <div className="text-sm text-gray-600 mb-1">
                              Required terms:
                            </div>
                            <div className="space-y-1">
                              {lesson.required_terms.map((termId) => {
                                const isCompleted =
                                  userCompletedTerms.includes(termId);
                                return (
                                  <div
                                    key={termId}
                                    className="flex items-center text-sm"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle className="text-green-500 h-4 w-4 mr-1 flex-shrink-0" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-1 flex-shrink-0"></div>
                                    )}
                                    <span
                                      className={
                                        isCompleted
                                          ? "text-green-600"
                                          : "text-gray-600"
                                      }
                                    >
                                      {getTermNameById(termId)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Glossary Terms Section */}
            <div className="mt-16">
              <div className="flex items-center mb-6">
                <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Glossary Terms
                </h2>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                {loading ? (
                  <div className="text-center py-4">Loading terms...</div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {sortedLetters.map((letter) => (
                        <a
                          key={letter}
                          href={`#letter-${letter}`}
                          className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors font-medium"
                        >
                          {letter}
                        </a>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {sortedLetters.map((letter) => (
                        <div
                          key={letter}
                          id={`letter-${letter}`}
                          className="term-group"
                        >
                          <h3 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-3">
                            {letter}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {groupedTerms[letter].map((term) => {
                              const isCompleted = userCompletedTerms.includes(
                                term.id
                              );
                              return (
                                <Link
                                  key={term.id}
                                  href={`/terms/${term.id}`}
                                  className={`flex items-center p-3 rounded-md border ${
                                    isCompleted
                                      ? "border-green-200 bg-green-50 hover:bg-green-100"
                                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                  } transition-colors`}
                                >
                                  {isCompleted && (
                                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                                  )}
                                  <div>
                                    <div className="font-medium">
                                      {term.term}
                                    </div>
                                    {term.full_form &&
                                      term.full_form !== term.term && (
                                        <div className="text-xs text-gray-500">
                                          {term.full_form}
                                        </div>
                                      )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// Get static props to load all lesson data
export const getStaticProps: GetStaticProps = async () => {
  const lessons = await getAllLessons();

  return {
    props: {
      lessons,
    },
  };
};

export default Home;
