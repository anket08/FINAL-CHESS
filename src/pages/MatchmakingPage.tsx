import React, { useState } from 'react';
import { ArrowLeft, Copy, Users, Clock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { createGameRoom, joinGameRoom } from '../services/firebase';

interface MatchmakingPageProps {
  onPageChange: (page: string) => void;
}

export const MatchmakingPage: React.FC<MatchmakingPageProps> = ({ onPageChange }) => {
  const { user, theme } = useAuthStore();
  const { initializeOnlineGame } = useGameStore();
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const code = await createGameRoom(user.uid);
      setCreatedRoomCode(code);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !roomCode.trim()) return;
    
    setIsJoining(true);
    try {
      const gameId = await joinGameRoom(roomCode.toUpperCase(), user.uid);
      if (gameId) {
        initializeOnlineGame(gameId);
        onPageChange('game');
      } else {
        alert('Room not found or already full');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room');
    } finally {
      setIsJoining(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(createdRoomCode);
  };

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onPageChange('play')}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={20} />
            Back to Play
          </button>
          
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Online Multiplayer
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Create a room or join an existing game
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room */}
          <div className={`p-8 rounded-2xl shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mx-auto ${
              theme === 'dark' ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <Users size={32} />
            </div>
            
            <h2 className={`text-2xl font-bold mb-4 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Create Room
            </h2>
            
            <p className={`text-center mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Create a new game room and share the code with a friend
            </p>

            {createdRoomCode ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-2 border-dashed ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="text-center">
                    <p className={`text-sm mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Room Code
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-2xl font-mono font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {createdRoomCode}
                      </span>
                      <button
                        onClick={copyRoomCode}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center justify-center gap-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock size={16} />
                  Waiting for opponent...
                </div>
              </div>
            ) : (
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isCreating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </button>
            )}
          </div>

          {/* Join Room */}
          <div className={`p-8 rounded-2xl shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mx-auto ${
              theme === 'dark' ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              <Users size={32} />
            </div>
            
            <h2 className={`text-2xl font-bold mb-4 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Join Room
            </h2>
            
            <p className={`text-center mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Enter a room code to join an existing game
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 rounded-lg border text-center font-mono text-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                maxLength={6}
              />
              
              <button
                onClick={handleJoinRoom}
                disabled={isJoining || !roomCode.trim()}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isJoining || !roomCode.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};