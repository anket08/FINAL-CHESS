import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ChessBoard } from '../components/ChessBoard';
import { GameSidebar } from '../components/GameSidebar';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';

interface GamePageProps {
  onPageChange: (page: string) => void;
}

export const GamePage: React.FC<GamePageProps> = ({ onPageChange }) => {
  const { currentGame, resetGame } = useGameStore();
  const { theme } = useAuthStore();

  const handleBackToMenu = () => {
    resetGame();
    onPageChange('play');
  };

  if (!currentGame) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <p className={`text-lg mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            No active game
          </p>
          <button
            onClick={() => onPageChange('play')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Start a Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b px-4 py-3`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={handleBackToMenu}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>

          <div className="text-center">
            <h1 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {currentGame.mode === 'ai' ? 'vs Computer' : 'Online Game'}
            </h1>
            {currentGame.status === 'active' && (
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {currentGame.currentPlayer === 'white' ? 'White' : 'Black'} to move
              </p>
            )}
          </div>

          <div className="w-32"> {/* Spacer for centering */}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Chess Board */}
        <div className="flex-1 flex items-center justify-center p-4 min-w-0">
          <ChessBoard />
        </div>

        {/* Sidebar */}
        <GameSidebar onNewGame={() => onPageChange('play')} />
      </div>
    </div>
  );
};