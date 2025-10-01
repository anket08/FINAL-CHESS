import React, { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { MatchmakingPage } from './pages/MatchmakingPage';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { theme, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'play':
        return <PlayPage onPageChange={setCurrentPage} />;
      case 'game':
        return <GamePage onPageChange={setCurrentPage} />;
      case 'matchmaking':
        return <MatchmakingPage onPageChange={setCurrentPage} />;
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;