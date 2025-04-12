import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import { FaPersonRunning, FaLaptopCode, FaGithub } from 'react-icons/fa6';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/quiz/:questionNumber" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 mb-4 flex items-center justify-center gap-2 print:hidden">
          <div className="flex items-center gap-1">
            micro app vibe coded{" "}
            <FaPersonRunning className="inline text-blue-400 text-lg dance-icon" />{" "}
            <FaLaptopCode className="inline text-blue-500 text-lg" /> by{" "}
            <a
              href="https://www.silv.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              silv.app
            </a>
          </div>
          <span className="mx-2">|</span>
          <a
            href="https://github.com/mattsilv/silv-learn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <FaGithub className="inline text-lg" /> GitHub
          </a>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;