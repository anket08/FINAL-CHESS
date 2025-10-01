import React from 'react';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Trophy, Download, Search } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { getOfflineGames } from '../services/storageService';
import { GameState } from '../types/chess';

export const HistoryPage: React.FC = () => {
  const { theme, user } = useAuthStore();
  const [games, setGames] = useState<GameState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameState | null>(null);
  const [showGameViewer, setShowGameViewer] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const offlineGames = await getOfflineGames(user?.uid);
        setGames(offlineGames);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [user?.uid]);

  const formatDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return 'In progress';
    const duration = Math.floor((endTime - startTime) / 1000 / 60);
    return `${duration}:${String(Math.floor((endTime - startTime) / 1000) % 60).padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getOpponentName = (game: GameState) => {
    if (game.mode === 'ai') return 'Computer';
    if (game.mode === 'local') return 'Local Player';
    return game.playerNames[1] || 'Unknown';
  };

  const getGameResult = (game: GameState) => {
    if (!game.result) return 'in-progress';
    if (game.result === 'white-wins') return 'win';
    if (game.result === 'black-wins') return 'loss';
    return 'draw';
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-500';
      case 'loss': return 'text-red-500';
      case 'draw': return 'text-yellow-500';
      case 'in-progress': return 'text-blue-500';
      default: return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    }
  };

  const exportAllGamesPGN = () => {
    if (games.length === 0) {
      alert('No games to export');
      return;
    }

    let pgnContent = '';
    games.forEach((game, index) => {
      pgnContent += `[Event "ChessMaster Game"]\n`;
      pgnContent += `[Site "ChessMaster"]\n`;
      pgnContent += `[Date "${new Date(game.createdAt).toISOString().split('T')[0]}"]\n`;
      pgnContent += `[Round "${index + 1}"]\n`;
      pgnContent += `[White "${game.playerNames[0] || 'White'}"]\n`;
      pgnContent += `[Black "${game.playerNames[1] || 'Black'}"]\n`;
      
      let result = '*';
      if (game.result === 'white-wins') result = '1-0';
      else if (game.result === 'black-wins') result = '0-1';
      else if (game.result === 'draw') result = '1/2-1/2';
      
      pgnContent += `[Result "${result}"]\n\n`;
      
      // Add moves
      const moves = game.moves;
      let moveText = '';
      for (let i = 0; i < moves.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        moveText += `${moveNumber}. ${moves[i]}`;
        if (moves[i + 1]) {
          moveText += ` ${moves[i + 1]}`;
        }
        moveText += ' ';
      }
      moveText += result;
      
      pgnContent += `${moveText}\n\n`;
    });

    // Create and download file
    const blob = new Blob([pgnContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chessmaster-games-${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewGame = (game: GameState) => {
    setSelectedGame(game);
    setShowGameViewer(true);
  };

  const analyzeGame = (game: GameState) => {
    // For now, same as view - can be enhanced later with analysis features
    setSelectedGame(game);
    setShowGameViewer(true);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return '✓';
      case 'loss': return '✗';
      case 'draw': return '½';
      case 'in-progress': return '⏳';
      default: return '?';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online': return '🌐';
      case 'ai': return '🤖';
      case 'local': return '🏠';
      default: return '♟️';
    }
  };

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Game History
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Review your past games and track your progress
          </p>
        </div>

        {/* Filters and Search */}
        <div className={`p-6 rounded-xl mb-8 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type="text"
                  placeholder="Search games..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}>
                <option value="all">All Modes</option>
                <option value="online">Online</option>
                <option value="ai">vs Computer</option>
                <option value="local">Local</option>
              </select>
              
              <select className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}>
                <option value="all">All Results</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
                <option value="draw">Draws</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Games', value: user?.stats.totalGames?.toString() || '0', color: 'blue' },
            { label: 'Wins', value: user?.stats.wins?.toString() || '0', color: 'green' },
            { label: 'Losses', value: user?.stats.losses?.toString() || '0', color: 'red' },
            { label: 'Draws', value: user?.stats.draws?.toString() || '0', color: 'yellow' },
          ].map((stat) => (
            <div key={stat.label} className={`p-6 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className={`text-2xl font-bold mb-1 ${
                stat.color === 'blue' ? 'text-blue-500' :
                stat.color === 'green' ? 'text-green-500' :
                stat.color === 'red' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {stat.value}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Games List */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Games
              </h2>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
                onClick={exportAllGamesPGN}
                <Download size={16} />
                Export PGN
              </button>
            </div>
          </div>

          {loading ? (
            <div className={`text-center py-16 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading games...</p>
            </div>
          ) : games.length === 0 ? (
            <div className={`text-center py-16 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No games found</p>
              <p>Start playing to build your game history</p>
            </div>
          ) : (
            <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {games.map((game) => {
                const result = getGameResult(game);
                const opponent = getOpponentName(game);
                return (
                <div key={game.id} className={`p-6 hover:bg-opacity-50 transition-colors cursor-pointer ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl ${getResultColor(result)}`}>
                        {getResultIcon(result)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getModeIcon(game.mode)}</span>
                          <span className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            vs {opponent}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result === 'win' 
                              ? 'bg-green-100 text-green-800' :
                            result === 'loss'
                              ? 'bg-red-100 text-red-800' :
                            result === 'in-progress'
                              ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-4 mt-1 text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(game.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDuration(game.createdAt, game.endedAt)}
                          </span>
                          <span>
                            {game.moves.length} moves
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className={`px-3 py-1 rounded text-sm transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                        onClick={() => viewGame(game)}
                      >
                        View
                      </button>
                      <button className={`px-3 py-1 rounded text-sm transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                        onClick={() => analyzeGame(game)}
                      >
                        Analyze
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Game Viewer Modal */}
        {showGameViewer && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`p-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Game Review
                  </h2>
                  <button
                    onClick={() => setShowGameViewer(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Game Info */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Game Information
                    </h3>
                    <div className={`space-y-2 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div><strong>Date:</strong> {formatDate(selectedGame.createdAt)}</div>
                      <div><strong>Mode:</strong> {selectedGame.mode}</div>
                      <div><strong>White:</strong> {selectedGame.playerNames[0]}</div>
                      <div><strong>Black:</strong> {selectedGame.playerNames[1]}</div>
                      <div><strong>Result:</strong> {getGameResult(selectedGame)}</div>
                      <div><strong>Moves:</strong> {selectedGame.moves.length}</div>
                      <div><strong>Duration:</strong> {formatDuration(selectedGame.createdAt, selectedGame.endedAt)}</div>
                    </div>
                  </div>
                  
                  {/* Move List */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Move List
                    </h3>
                    <div className={`max-h-64 overflow-y-auto p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      {selectedGame.moves.length === 0 ? (
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No moves recorded
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {(() => {
                            const movePairs = [];
                            for (let i = 0; i < selectedGame.moves.length; i += 2) {
                              movePairs.push({
                                moveNumber: Math.floor(i / 2) + 1,
                                white: selectedGame.moves[i],
                                black: selectedGame.moves[i + 1] || '',
                              });
                            }
                            return movePairs.map((pair) => (
                              <div key={pair.moveNumber} className={`flex items-center gap-4 py-1 px-2 rounded text-sm ${
                                theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
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
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* PGN Export for single game */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      const pgnContent = `[Event "ChessMaster Game"]
[Site "ChessMaster"]
[Date "${new Date(selectedGame.createdAt).toISOString().split('T')[0]}"]
[White "${selectedGame.playerNames[0] || 'White'}"]
[Black "${selectedGame.playerNames[1] || 'Black'}"]
[Result "${selectedGame.result === 'white-wins' ? '1-0' : selectedGame.result === 'black-wins' ? '0-1' : selectedGame.result === 'draw' ? '1/2-1/2' : '*'}"]

${selectedGame.moves.map((move, i) => {
  if (i % 2 === 0) {
    const moveNumber = Math.floor(i / 2) + 1;
    const nextMove = selectedGame.moves[i + 1];
    return `${moveNumber}. ${move}${nextMove ? ` ${nextMove}` : ''}`;
  }
  return '';
}).filter(Boolean).join(' ')} ${selectedGame.result === 'white-wins' ? '1-0' : selectedGame.result === 'black-wins' ? '0-1' : selectedGame.result === 'draw' ? '1/2-1/2' : '*'}`;

                      const blob = new Blob([pgnContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `game-${selectedGame.id}.pgn`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <Download size={16} className="inline mr-2" />
                    Export This Game as PGN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};