import { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import {
  CheckCircle,
  BookOpen,
  Trophy,
  Star,
  Lock,
  Book,
  ChevronRight,
} from "lucide-react";
import {
  getAllLessons,
  getAllTopics,
  getLessonsByTopic,
  getHighestAvailableLevelForTopic,
  Lesson,
} from "../utils/lessonService";
import { getAllTerms } from "../utils/glossaryService";
import { getUserProgress } from "../utils/userProgressService";
import { useState, useEffect } from "react";
import { GlossaryTerm } from "../types/glossary";
import LoginButton from "../components/LoginButton";

type HomeProps = {
  lessons: Lesson[];
  topics: string[];
};

const Home: NextPage<HomeProps> = ({ lessons, topics }) => {
  const [userCompletedTerms, setUserCompletedTerms] = useState<string[]>([]);
  const [userCompletedLessons, setUserCompletedLessons] = useState<string[]>(
    []
  );
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicLessons, setTopicLessons] = useState<{ [key: string]: Lesson[] }>(
    {}
  );
  const [highestAvailableLevels, setHighestAvailableLevels] = useState<{
    [key: string]: number;
  }>({});
  const [expandedTopics, setExpandedTopics] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get all glossary terms
        const terms = getAllTerms();
        setGlossaryTerms(terms);

        // Get user progress
        const userProgress = await getUserProgress();
        setUserCompletedTerms(userProgress.completedTerms || []);
        setUserCompletedLessons(userProgress.completedLessons || []);

        // Organize lessons by topic
        const lessonsByTopic: { [key: string]: Lesson[] } = {};
        for (const topic of topics) {
          const topicLessons = await getLessonsByTopic(topic);
          lessonsByTopic[topic] = topicLessons;

          // Set all topics to be expanded by default
          setExpandedTopics((prev) => ({
            ...prev,
            [topic]: true,
          }));

          // Get highest available level for each topic
          const highestLevel = await getHighestAvailableLevelForTopic(
            topic,
            userProgress.completedLessons || []
          );

          setHighestAvailableLevels((prev) => ({
            ...prev,
            [topic]: highestLevel,
          }));
        }

        setTopicLessons(lessonsByTopic);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [topics]);

  // Toggle a topic's expanded state
  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

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

  // Check if a lesson is accessible based on its level
  const isLessonAccessible = (topic: string, level: number): boolean => {
    if (level === 100) return true; // Level 100 courses are always accessible
    return level <= (highestAvailableLevels[topic] || 100);
  };

  // Format level for display (e.g., 100 -> "100-level")
  const formatLevel = (level: number): string => {
    return `${level}-level`;
  };

  const groupedTerms = !loading ? groupTermsByFirstLetter() : {};
  const sortedLetters = Object.keys(groupedTerms).sort();

  return (
    <>
      <Head>
        <title>silvlearn - Learning through microlessons</title>
        <meta
          name="description"
          content="silvlearn - Learning through microlessons. An interactive microlearning platform."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Learning Paths
              </h1>
              {!loading && (
                <div className="flex items-center text-sm">
                  <Trophy size={16} className="text-blue-500 mr-1" />
                  <span className="font-medium">
                    {userCompletedLessons.length}/{lessons.length}
                  </span>
                  <span className="text-gray-500 ml-1">lessons</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">Loading lessons...</div>
            ) : (
              <div className="space-y-10">
                {topics.map((topic) => (
                  <div
                    key={topic}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleTopic(topic)}
                      className="w-full flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 focus:outline-none"
                    >
                      <h2 className="text-xl font-semibold text-gray-900">
                        {topic}
                      </h2>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                          expandedTopics[topic] ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {expandedTopics[topic] && (
                      <div className="p-4">
                        {/* Group lessons by level */}
                        {[100, 200, 300].map((level) => {
                          const levelLessons =
                            topicLessons[topic]?.filter(
                              (lesson) => lesson.level === level
                            ) || [];

                          if (levelLessons.length === 0) return null;

                          const isAccessible = isLessonAccessible(topic, level);

                          return (
                            <div
                              key={`${topic}-${level}`}
                              className="mb-6 last:mb-0"
                            >
                              <div className="flex items-center mb-3">
                                <Book
                                  size={18}
                                  className={`mr-2 ${
                                    isAccessible
                                      ? "text-blue-600"
                                      : "text-gray-400"
                                  }`}
                                />
                                <h3
                                  className={`text-lg font-medium ${
                                    isAccessible
                                      ? "text-gray-900"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {formatLevel(level)}
                                  {!isAccessible && (
                                    <span className="ml-2 inline-flex items-center">
                                      <Lock size={14} className="mr-1" />
                                      <span className="text-sm">
                                        Complete lower levels first
                                      </span>
                                    </span>
                                  )}
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {levelLessons.map((lesson) => {
                                  const isCompleted =
                                    userCompletedLessons.includes(
                                      lesson.id.toString()
                                    );

                                  return (
                                    <Link
                                      href={
                                        isAccessible
                                          ? `/lessons/${lesson.slug}`
                                          : "#"
                                      }
                                      key={lesson.id}
                                      className={`block bg-white rounded-lg border ${
                                        isCompleted
                                          ? "border-l-4 border-green-500"
                                          : isAccessible
                                          ? "border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                                          : "border border-gray-200 opacity-60 cursor-not-allowed"
                                      } overflow-hidden transition-all`}
                                      onClick={(e) => {
                                        if (!isAccessible) {
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      <div className="p-4">
                                        <h4
                                          className={`text-base font-medium mb-2 ${
                                            isAccessible
                                              ? "text-gray-900"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {lesson.title}
                                        </h4>
                                        <div className="flex items-center justify-between mt-3">
                                          <div className="flex items-center text-sm text-gray-500">
                                            <span
                                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                isAccessible
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-gray-100 text-gray-600"
                                              }`}
                                            >
                                              {lesson.duration_minutes} min
                                            </span>
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {lesson.metadata.difficulty_level}
                                          </div>
                                        </div>

                                        {isCompleted && (
                                          <div className="mt-2">
                                            <span className="inline-flex items-center text-sm text-green-600">
                                              <CheckCircle
                                                size={14}
                                                className="mr-1"
                                              />
                                              Completed
                                            </span>
                                          </div>
                                        )}

                                        {!loading &&
                                          lesson.required_terms &&
                                          lesson.required_terms.length > 0 && (
                                            <div className="mt-3 border-t pt-3">
                                              <div className="text-sm text-gray-600 mb-1">
                                                Required terms:
                                              </div>
                                              <div className="space-y-1">
                                                {lesson.required_terms.map(
                                                  (termId) => {
                                                    const isTermCompleted =
                                                      userCompletedTerms.includes(
                                                        termId
                                                      );
                                                    return (
                                                      <div
                                                        key={termId}
                                                        className="flex items-center text-sm"
                                                      >
                                                        {isTermCompleted ? (
                                                          <CheckCircle className="text-green-500 h-4 w-4 mr-1 flex-shrink-0" />
                                                        ) : (
                                                          <div className="h-4 w-4 rounded-full border border-gray-300 mr-1 flex-shrink-0"></div>
                                                        )}
                                                        <span
                                                          className={
                                                            isTermCompleted
                                                              ? "text-green-600"
                                                              : "text-gray-600"
                                                          }
                                                        >
                                                          {getTermNameById(
                                                            termId
                                                          )}
                                                        </span>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Glossary Terms Section */}
            <div className="mt-16">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Glossary Terms
                  </h2>
                </div>
                {!loading && (
                  <div className="flex items-center text-sm">
                    <Star size={16} className="text-yellow-500 mr-1" />
                    <span className="font-medium">
                      {userCompletedTerms.length}/{glossaryTerms.length}
                    </span>
                    <span className="text-gray-500 ml-1">terms</span>
                  </div>
                )}
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
                                  {isCompleted ? (
                                    <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border border-gray-300 mr-2 flex-shrink-0"></div>
                                  )}
                                  <span
                                    className={
                                      isCompleted
                                        ? "text-green-700 font-medium"
                                        : "text-gray-700"
                                    }
                                  >
                                    {term.term}
                                  </span>
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

export const getStaticProps: GetStaticProps = async () => {
  const lessons = await getAllLessons();
  const topics = await getAllTopics();

  return {
    props: {
      lessons,
      topics,
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
};

export default Home;
