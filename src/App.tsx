import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import { ThemeSwitcher } from './components/common/ThemeSwitcher';
import AppVersion from './components/common/AppVersion';
import { Text } from './components/catalyst/text';
import { Link } from './components/catalyst/link';

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
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <ThemeSwitcher />
            <div className="p-4">
              <AppVersion />
            </div>
          </div>
          <div className="text-center pb-6 text-sm text-gray-500 dark:text-gray-400">
            <Text>
              this is an app vibe coded by {' '}
              <Link href="https://silv.app" target="_blank" rel="noopener noreferrer">
                silv.app
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;