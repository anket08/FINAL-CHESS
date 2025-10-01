import React from 'react';
import { Clock, User, Flag, Square, Trophy, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';

interface GameSidebarProps {
  onNewGame?: () => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({ onNewGame }) => {
  const { currentGame, chess, finishGame, resetGame, whiteTime, blackTime } = useGameStore();
  const { theme } = useAuthStore();

  const handleResign = () => {
    if (!currentGame || currentGame.status !== 'active') return;
    
    if (!confirm('Are you sure you want to resign?')) return;
    
    // Current player resigns, opponent wins
    const result = currentGame.currentPlayer === 'white' ? 'black-wins' : 'white-wins';
    finishGame(result);
  };

  const handleDraw = () => {
    if (!currentGame || currentGame.status !== 'active') return;
    
    if (!confirm('Offer a draw?')) return;
    
    finishGame('draw');
  };

  const handleNewGame = () => {
    resetGame();
    if (onNewGame) {
      onNewGame();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGameResultMessage = () => {
    if (!currentGame || currentGame.status !== 'finished') return null;
    
    switch (currentGame.result) {
      case 'white-wins':
        return currentGame.mode === 'ai' ? 'You Won! 🎉' : 'White Wins!';
      case 'black-wins':
        return currentGame.mode === 'ai' ? 'Computer Wins!' : 'Black Wins!';
      case 'draw':
        return 'Game Drawn';
      default:
        return 'Game Over';
    }
  };

  if (!currentGame) return null;

  const moves = currentGame.moves;
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || '',
    });
  }

  return (
    <div className={`w-80 h-full flex flex-col ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } border-l`}>
      {/* Game Result Banner */}
      {currentGame.status === 'finished' && (
        <div className={`p-4 text-center ${
          currentGame.result === 'white-wins' && currentGame.mode === 'ai'
            ? 'bg-green-100 text-green-800 border-green-200'
            : currentGame.result === 'black-wins' && currentGame.mode === 'ai'
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
        } border-b`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={20} />
            <span className="font-bold text-lg">{getGameResultMessage()}</span>
          </div>
          <button
            onClick={handleNewGame}
            className={`flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <RotateCcw size={16} />
            New Game
          </button>
        </div>
      )}

      {/* Players */}
      <div className="p-4 space-y-4">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          currentGame.currentPlayer === 'black' 
            ? theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            : ''
        }`}>
          <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
          <User size={18} />
          <span className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {currentGame.playerNames[1] || 'Black'}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Clock size={16} />
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              15:00
            </span>
          </div>
        </div>

      </div>

      {/* Game Controls */}
      {currentGame.status === 'active' && (
        <div className="px-4 pb-4">
        <div className="flex gap-2">
          <button 
            onClick={handleResign}
            disabled={currentGame.status !== 'active'}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              currentGame.status !== 'active'
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : theme === 'dark'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
            }`}>
            <Flag size={16} />
            Resign
          </button>
          <button 
            onClick={handleDraw}
            disabled={currentGame.status !== 'active'}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              currentGame.status !== 'active'
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}>
            <Square size={16} />
            Draw
          </button>
        </div>
        </div>
      )}

      {/* Move List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className={`px-4 py-2 border-b font-medium ${
          theme === 'dark'
            ? 'text-white border-gray-700'
            : 'text-gray-900 border-gray-200'
        }`}>
          Move List
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {movePairs.length === 0 ? (
            <div className={`text-center text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No moves yet
            </div>
          ) : (
            <div className="space-y-1">
              {movePairs.map((pair) => (
                <div key={pair.moveNumber} className={`flex items-center gap-4 py-1 px-2 rounded text-sm ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <span className={`w-6 text-right ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {pair.moveNumber}.
                  </span>
                  <span className={`flex-1 font-mono ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {pair.white}
                  </span>
                  {pair.black && (
                    <span className={`flex-1 font-mono ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {pair.black}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};