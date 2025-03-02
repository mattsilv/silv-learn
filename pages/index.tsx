import { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { Book } from "lucide-react";
import { getAllLessons } from "../utils/lessonService";
import type { Lesson } from "../utils/lessonService";

type HomeProps = {
  lessons: Lesson[];
};

const Home: NextPage<HomeProps> = ({ lessons }) => {
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      {lesson.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
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
