import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Book,
  Headphones,
  Video,
  CheckCircle,
  Settings,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Save,
} from "lucide-react";
import { useRouter } from "next/router";
import type { Lesson } from "../utils/lessonService";
import { GlossaryTerm } from "../types/glossary";
import TermHighlighter from "./TermHighlighter";
import { updateUserCompletedLessons } from "../utils/userProgressService";

type LearningStyle = "reading" | "listening" | "watching";

type MicrolearningPlatformProps = {
  lesson: Lesson;
  glossaryTerms: GlossaryTerm[];
  userCompletedTerms: string[];
  refreshUserStats?: () => Promise<void>;
};

const MicrolearningPlatform: React.FC<MicrolearningPlatformProps> = ({
  lesson,
  glossaryTerms,
  userCompletedTerms,
  refreshUserStats,
}) => {
  // Learning style states
  const [activeStyle, setActiveStyle] = useState<LearningStyle>("reading");
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userCompletedLessons, setUserCompletedLessons] = useState<string[]>(
    []
  );

  // Current question
  const currentQuestion = lesson.quiz.questions[currentQuestionIndex];

  // Router
  const router = useRouter();

  // Handle selecting an answer
  const handleAnswerSelect = (answerIndex: number) => {
    // Store selected answer
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);

    // Show explanation
    setShowExplanation(true);

    // Track correct answers
    if (answerIndex === currentQuestion.correct_answer_index) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  // Handle moving to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < lesson.quiz.questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
    }
  };

  // Handle resetting the quiz
  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setCorrectAnswers(0);
  };

  // Update user progress when quiz is completed
  useEffect(() => {
    if (quizCompleted && correctAnswers >= lesson.quiz.questions.length * 0.7) {
      const updateProgress = async () => {
        // Update completed lessons
        await updateUserCompletedLessons([
          ...userCompletedLessons,
          lesson.id.toString(),
        ]);

        // Refresh user stats if available
        if (refreshUserStats) {
          await refreshUserStats();
        }
      };

      updateProgress();
    }
  }, [
    quizCompleted,
    correctAnswers,
    lesson.id,
    lesson.quiz.questions.length,
    refreshUserStats,
    userCompletedLessons,
  ]);

  // Handle toggling the learning style menu
  const toggleStyleMenu = () => {
    setShowStyleMenu(!showStyleMenu);
  };

  // Handle changing the learning style
  const changeStyle = (style: LearningStyle) => {
    setActiveStyle(style);
    setShowStyleMenu(false);
  };

  // Render the main content based on the active learning style
  const renderContent = () => {
    switch (activeStyle) {
      case "reading":
        return (
          <div className="space-y-6">
            {lesson.learning_styles.reading.content.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {section.title}
                </h3>
                <div className="text-gray-700">
                  <TermHighlighter
                    content={section.text}
                    glossaryTerms={glossaryTerms}
                    userLearnedTerms={userCompletedTerms}
                  />
                </div>
              </div>
            ))}

            <div className="mt-8">
              <figure className="bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={lesson.learning_styles.reading.image.url}
                  alt={lesson.learning_styles.reading.image.alt}
                  className="w-full h-auto"
                />
                <figcaption className="p-3 text-sm text-center text-gray-600">
                  {lesson.learning_styles.reading.image.caption}
                </figcaption>
              </figure>
            </div>
          </div>
        );

      case "listening":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-600 text-white p-2 rounded-full">
                  <Headphones size={18} />
                </div>
                <div>
                  <h3 className="font-medium">Audio Lesson</h3>
                  <p className="text-sm text-gray-500">
                    Listen to the lesson audio
                  </p>
                </div>
              </div>

              <div className="bg-white rounded border p-2">
                {/* This would be replaced with an actual audio player */}
                <div className="h-12 flex items-center justify-center text-gray-500">
                  Audio Player: {lesson.learning_styles.listening.audio_url}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Audio Transcript
              </h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-700">
                <TermHighlighter
                  content={lesson.learning_styles.listening.transcript}
                  glossaryTerms={glossaryTerms}
                  userLearnedTerms={userCompletedTerms}
                />
              </div>
            </div>
          </div>
        );

      case "watching":
        return (
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              {/* This would be replaced with an actual video player */}
              <div
                className="h-64 flex items-center justify-center bg-gray-800 text-white relative"
                style={{
                  backgroundImage: `url(${lesson.learning_styles.watching.thumbnail_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-indigo-600 bg-opacity-20 rounded-full p-4">
                    <Video size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Key Points
              </h3>
              <ul className="space-y-2">
                {lesson.learning_styles.watching.key_points.map(
                  (point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-500 mr-2 mt-1">
                        <CheckCircle size={16} />
                      </span>
                      <div className="flex-1">
                        <TermHighlighter
                          content={point}
                          glossaryTerms={glossaryTerms}
                          userLearnedTerms={userCompletedTerms}
                        />
                      </div>
                    </li>
                  )
                )}
              </ul>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-600">
                <h4 className="font-medium mb-2">Video Transcript</h4>
                <TermHighlighter
                  content={lesson.learning_styles.watching.transcript}
                  glossaryTerms={glossaryTerms}
                  userLearnedTerms={userCompletedTerms}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render the quiz
  const renderQuiz = () => {
    return (
      <div className="space-y-6">
        {quizCompleted ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-6">
              You got {correctAnswers} out of {lesson.quiz.questions.length}{" "}
              questions correct.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => {
                  router.push("/");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Back to Lessons
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Question {currentQuestionIndex + 1} of{" "}
                {lesson.quiz.questions.length}
              </h3>
              <div className="text-sm text-gray-500">
                {correctAnswers} correct so far
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-xl font-medium mb-4">
                {currentQuestion.question}
              </h4>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full text-left p-3 rounded-lg border ${
                      showExplanation
                        ? index === currentQuestion.correct_answer_index
                          ? "bg-green-50 border-green-200"
                          : selectedAnswers[currentQuestionIndex] === index
                          ? "bg-red-50 border-red-200"
                          : "bg-white border-gray-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border ${
                          showExplanation
                            ? index === currentQuestion.correct_answer_index
                              ? "border-green-500 bg-green-500 text-white"
                              : selectedAnswers[currentQuestionIndex] === index
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-gray-300"
                            : "border-gray-300"
                        } flex items-center justify-center mr-3 mt-0.5`}
                      >
                        {showExplanation &&
                          index === currentQuestion.correct_answer_index && (
                            <CheckCircle size={14} />
                          )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {showExplanation && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-indigo-800">
                  <h5 className="font-medium mb-1">Explanation</h5>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setShowQuiz(false)}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Lesson
          </button>
          {showExplanation && (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              {currentQuestionIndex < lesson.quiz.questions.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Head>
        <title>{lesson.title} | silvlearn</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-500 text-sm">
          {lesson.duration_minutes} min
        </div>
        <div className="relative">
          <button
            onClick={toggleStyleMenu}
            className="flex items-center px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Settings size={18} className="mr-2 text-gray-500" />
            <span>Learning Style: </span>
            <span className="font-medium ml-1 capitalize">{activeStyle}</span>
            <ChevronRight
              size={18}
              className={`ml-2 text-gray-500 transition-transform ${
                showStyleMenu ? "rotate-90" : ""
              }`}
            />
          </button>

          {showStyleMenu && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-10">
              <div className="p-2">
                <button
                  onClick={() => changeStyle("reading")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeStyle === "reading"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <Book size={18} className="mr-2" />
                  <span>Reading</span>
                </button>
                <button
                  onClick={() => changeStyle("listening")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeStyle === "listening"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <Headphones size={18} className="mr-2" />
                  <span>Listening</span>
                </button>
                <button
                  onClick={() => changeStyle("watching")}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeStyle === "watching"
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <Video size={18} className="mr-2" />
                  <span>Watching</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {showQuiz ? renderQuiz() : renderContent()}
      </main>

      {!showQuiz && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <CheckCircle size={18} className="mr-2" />
            Test Your Knowledge
          </button>

          <button
            onClick={() => {
              // Save progress logic would go here
              // For now, we'll just redirect to home
              router.push("/");
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Save size={18} className="mr-2" />
            Save Progress & Exit
          </button>
        </div>
      )}
    </div>
  );
};

export default MicrolearningPlatform;
