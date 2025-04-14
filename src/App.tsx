import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import MyAccountPage from './pages/MyAccountPage';
import { FaPersonRunning, FaLaptopCode, FaGithub } from 'react-icons/fa6';
import {
  Navbar, 
  NavbarItem, 
  NavbarLabel, 
  NavbarSection, 
  NavbarSpacer 
} from './components/catalyst/navbar';
import {
  Dropdown, 
  DropdownButton, 
  DropdownMenu, 
  DropdownItem, 
  DropdownLabel 
} from './components/catalyst/dropdown';
import { Logo } from './components/common/Logo';
import { Bars3Icon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useAuth } from './hooks/useAuth';
import { LoginModal } from './components/auth/LoginModal';

// New component to contain the layout and routing logic
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setTokenCallback, logout, user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Log token value on every render
  console.log('[AppLayout Render] Token from context:', token);

  // Effect to capture token from URL on mount
  useEffect(() => {
    console.log('[Effect Run] location.search:', location.search); // Log 1
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    console.log('[Effect Run] Extracted urlToken:', urlToken); // Log 2

    if (urlToken) {
      console.log('[Effect Run] Token FOUND. Storing and Navigating...'); // Log 3
      console.log('[Effect Run] Calling setTokenCallback...'); // Log 4
      setTokenCallback(urlToken);
      console.log('[Effect Run] Called setTokenCallback.'); // Log 5
      console.log('[Effect Run] Calling navigate("/account")...'); // Log 6
      navigate('/account', { replace: true });
    } else {
      console.log('[Effect Run] No token found in URL params.'); // Log 7 (If token missing)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, setTokenCallback, navigate]);

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCurrent = (path: string) => {
    if (path === '/quiz/1' && location.pathname.startsWith('/quiz/')) return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-white/75 dark:bg-gray-900/75 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Navbar>
            <NavbarSection className="hidden md:flex">
              <NavbarItem href="/" aria-label="Home" current={isCurrent('/')}>
                <Logo />
              </NavbarItem>
              <NavbarItem href="/quiz/1" current={isCurrent('/quiz/1')}>
                <NavbarLabel>Quiz</NavbarLabel>
              </NavbarItem>
              {token && (
                <NavbarItem href="/account" current={isCurrent('/account')}>
                  <NavbarLabel>My Account</NavbarLabel>
                </NavbarItem>
              )}
            </NavbarSection>

            <NavbarSpacer className="hidden md:block" />

            <NavbarSection className="hidden md:flex">
              {token && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                  <NavbarItem onClick={handleLogout} className="cursor-pointer">
                    <NavbarLabel>Logout</NavbarLabel>
                  </NavbarItem>
                </div>
              ) : (
                <NavbarItem onClick={handleLogin} className="cursor-pointer">
                  <NavbarLabel>Login</NavbarLabel>
                </NavbarItem>
              )}
            </NavbarSection>

            <div className="flex flex-1 items-center md:hidden">
              <NavbarItem href="/" aria-label="Home" className="flex-1">
                <Logo />
              </NavbarItem>

              <Dropdown>
                <DropdownButton plain aria-label="Open navigation menu">
                  <Bars3Icon className="size-6" />
                </DropdownButton>
                <DropdownMenu anchor="bottom end" className="z-50 mt-1 shadow-lg">
                  <DropdownItem
                    href="/"
                    className={clsx(isCurrent('/') && 'bg-gray-100 dark:bg-gray-700')}
                  >
                    <DropdownLabel>Home</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem
                    href="/quiz/1"
                    className={clsx(isCurrent('/quiz/1') && 'bg-gray-100 dark:bg-gray-700')}
                  >
                    <DropdownLabel>Quiz</DropdownLabel>
                  </DropdownItem>
                  {token && (
                    <DropdownItem
                      href="/account"
                      className={clsx(isCurrent('/account') && 'bg-gray-100 dark:bg-gray-700')}
                    >
                      <DropdownLabel>My Account</DropdownLabel>
                    </DropdownItem>
                  )}
                  {token ? (
                    <DropdownItem onClick={handleLogout} className="headlessui-menu-item">
                      <DropdownLabel>Logout <span className="text-xs text-gray-500 ml-1">({user?.email})</span></DropdownLabel>
                    </DropdownItem>
                  ) : (
                    <DropdownItem onClick={handleLogin} className="headlessui-menu-item">
                      <DropdownLabel>Login</DropdownLabel>
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </Navbar>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/quiz/:questionNumber" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/account" element={<MyAccountPage />} />
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

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

// App component now just sets up the Router
function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;