/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { GameProvider, useGame } from './context/GameContext';
import { BackgroundShapes } from './components/common/BackgroundShapes';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DownloadShortcutButton } from './components/common/DownloadShortcutButton';
import { sounds } from './lib/sounds';

// Lazy load pages
const MenuPage = lazy(() => import('./pages/MenuPage').then(m => ({ default: m.MenuPage })));
const GamePage = lazy(() => import('./pages/GamePage').then(m => ({ default: m.GamePage })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then(m => ({ default: m.ResultsPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-retro-bg z-50">
        <div className="font-mono text-retro-text uppercase tracking-widest animate-pulse">
          [ LOADING GAME... ]
        </div>
      </div>
    }>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MenuPage />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const AppContent = () => {
  const { theme } = useGame();

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen selection:bg-retro-pink selection:text-white font-sans overflow-x-hidden ${theme}`}>
      <div className="min-h-screen bg-retro-bg text-retro-text transition-colors duration-300">
        <div className="scanlines" />
        <BackgroundShapes />
        <SettingsPanel />
        <DownloadShortcutButton />

        <Header />

        <AnimatedRoutes />
        <Footer />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </Router>
  );
}
