import React, { useState } from "react";
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
} from "lucide-react";
import type { Lesson } from "../utils/lessonService";

type LearningStyle = "reading" | "listening" | "watching";

type MicrolearningPlatformProps = {
  lesson: Lesson;
};

const MicrolearningPlatform: React.FC<MicrolearningPlatformProps> = ({
  lesson,
}) => {
  // Learning style states
  const [activeStyle, setActiveStyle] = useState<LearningStyle>("reading");
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Handle answering a question
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (
      answerIndex ===
      lesson.quiz.questions[currentQuestion].correct_answer_index
    ) {
      setScore(score + 1);
    }
  };

  // Move to next question or show results
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (currentQuestion < lesson.quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowQuiz(false);
  };

  // Toggle learning style menu
  const toggleStyleMenu = () => {
    setShowStyleMenu(!showStyleMenu);
  };

  // Change learning style
  const changeStyle = (style: LearningStyle) => {
    setActiveStyle(style);
    setShowStyleMenu(false);
  };

  // Render content based on learning style
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
                <p className="text-gray-700 leading-relaxed">{section.text}</p>
              </div>
            ))}
            <div className="mt-6 mb-2 rounded-lg bg-gray-100 p-4">
              <div className="flex items-center justify-center">
                <img
                  src={lesson.learning_styles.reading.image.url}
                  className="max-w-full h-auto rounded"
                  alt={lesson.learning_styles.reading.image.alt}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                {lesson.learning_styles.reading.image.caption}
              </p>
            </div>
          </div>
        );

      case "listening":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-md bg-white rounded-full h-2 shadow-inner overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full w-3/5"></div>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mb-6">
                <button className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
                  <ArrowLeft size={20} />
                </button>
                <button className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600">
                  <Headphones size={24} />
                </button>
                <button className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Audio Transcript
                </h3>
                <p className="text-gray-600 italic leading-relaxed">
                  {lesson.learning_styles.listening.transcript}
                </p>
              </div>
            </div>
          </div>
        );

      case "watching":
        return (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="relative pb-16/9">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <img
                    src={lesson.learning_styles.watching.thumbnail_url}
                    className="max-w-full max-h-full"
                    alt="Video thumbnail"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white bg-opacity-80 rounded-full p-4">
                      <Video className="text-blue-600" size={32} />
                    </div>
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
                      <span className="text-blue-500 mr-2 mt-1">
                        <CheckCircle size={16} />
                      </span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  )
                )}
              </ul>

              <div className="mt-4 text-gray-600">
                <p className="italic">
                  {lesson.learning_styles.watching.transcript}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Please select a learning style</div>;
    }
  };

  // Render quiz
  const renderQuiz = () => {
    if (showResults) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-center mb-4">
            Quiz Results
          </h3>
          <div className="flex justify-center mb-6">
            <div className="text-5xl font-bold text-blue-600">{score}</div>
            <div className="text-2xl text-gray-400 self-end ml-1 mb-1">
              / {lesson.quiz.questions.length}
            </div>
          </div>

          <p className="text-center text-gray-700 mb-6">
            {score === lesson.quiz.questions.length
              ? "Excellent! You've mastered this topic."
              : score >= lesson.quiz.questions.length / 2
              ? "Good job! Review the material to improve your understanding."
              : "Keep learning! We recommend revisiting the lesson."}
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleResetQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Content
            </button>
          </div>
        </div>
      );
    }

    const currentQ = lesson.quiz.questions[currentQuestion];

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestion + 1} of {lesson.quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            Score: {score}
          </span>
        </div>

        <h3 className="text-xl font-medium text-gray-800 mb-4">
          {currentQ.question}
        </h3>

        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => (
            <div
              key={index}
              onClick={() => !isAnswered && handleAnswerSelect(index)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isAnswered
                  ? index === currentQ.correct_answer_index
                    ? "bg-green-50 border-green-300"
                    : index === selectedAnswer
                    ? "bg-red-50 border-red-300"
                    : "bg-white border-gray-200"
                  : selectedAnswer === index
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center border ${
                    isAnswered
                      ? index === currentQ.correct_answer_index
                        ? "bg-green-500 border-green-500 text-white"
                        : index === selectedAnswer
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-gray-300"
                      : selectedAnswer === index
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {isAnswered && index === currentQ.correct_answer_index && (
                    <CheckCircle size={14} />
                  )}
                </div>
                <span
                  className={`${
                    isAnswered
                      ? index === currentQ.correct_answer_index
                        ? "text-green-700"
                        : index === selectedAnswer
                        ? "text-red-700"
                        : "text-gray-700"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isAnswered && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleResetQuiz}
            className="px-4 py-2 rounded-lg flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Content
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={!isAnswered}
            className={`px-4 py-2 rounded-lg flex items-center ${
              isAnswered
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            } transition-colors`}
          >
            {currentQuestion < lesson.quiz.questions.length - 1
              ? "Next Question"
              : "See Results"}
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <>
      <Head>
        <title>{`MicroLearn - ${lesson.title}`}</title>
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
              <div className="relative">
                <button
                  onClick={toggleStyleMenu}
                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
                  aria-expanded={showStyleMenu}
                  aria-haspopup="true"
                >
                  <Settings size={18} className="mr-2" />
                  <span>Learning Style</span>
                </button>

                {showStyleMenu && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button
                      onClick={() => changeStyle("reading")}
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        activeStyle === "reading"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      } hover:bg-gray-50`}
                    >
                      <Book size={16} className="mr-2" />
                      Reading
                    </button>
                    <button
                      onClick={() => changeStyle("listening")}
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        activeStyle === "listening"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      } hover:bg-gray-50`}
                    >
                      <Headphones size={16} className="mr-2" />
                      Listening
                    </button>
                    <button
                      onClick={() => changeStyle("watching")}
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        activeStyle === "watching"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      } hover:bg-gray-50`}
                    >
                      <Video size={16} className="mr-2" />
                      Watching
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1">
                  <div className="flex items-center">
                    {activeStyle === "reading" && (
                      <Book size={18} className="text-blue-600 mr-2" />
                    )}
                    {activeStyle === "listening" && (
                      <Headphones size={18} className="text-blue-600 mr-2" />
                    )}
                    {activeStyle === "watching" && (
                      <Video size={18} className="text-blue-600 mr-2" />
                    )}
                    <h2 className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                      {activeStyle === "reading" && "Reading"}
                      {activeStyle === "listening" && "Listening"}
                      {activeStyle === "watching" && "Watching"}
                    </h2>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-1">
                    {lesson.title}
                  </h1>
                </div>
                <div className="ml-4">
                  <div className="bg-blue-100 rounded-full px-2 py-1 text-xs font-medium text-blue-800">
                    {lesson.duration_minutes} min
                  </div>
                </div>
              </div>

              <div className="w-full h-1 bg-gray-200 rounded-full mt-3">
                <div
                  className="bg-blue-600 h-1 rounded-full"
                  style={{ width: showQuiz ? "100%" : "50%" }}
                ></div>
              </div>
            </div>

            {/* Learning content */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="p-6">
                {!showQuiz ? renderContent() : renderQuiz()}
              </div>

              {!showQuiz && !showResults && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      Take Quiz
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Learning style footer */}
            <div className="flex justify-center space-x-4 mt-8 mb-4">
              <button
                onClick={() => changeStyle("reading")}
                className={`flex flex-col items-center p-3 rounded-lg ${
                  activeStyle === "reading"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Book size={20} />
                <span className="text-xs mt-1">Reading</span>
              </button>
              <button
                onClick={() => changeStyle("listening")}
                className={`flex flex-col items-center p-3 rounded-lg ${
                  activeStyle === "listening"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Headphones size={20} />
                <span className="text-xs mt-1">Listening</span>
              </button>
              <button
                onClick={() => changeStyle("watching")}
                className={`flex flex-col items-center p-3 rounded-lg ${
                  activeStyle === "watching"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Video size={20} />
                <span className="text-xs mt-1">Watching</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default MicrolearningPlatform;
