import React from 'react';
import { Users, Cpu, Monitor, Globe, Clock, Trophy } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';

interface PlayPageProps {
  onPageChange: (page: string) => void;
}

export const PlayPage: React.FC<PlayPageProps> = ({ onPageChange }) => {
  const { theme } = useAuthStore();
  const { setGameMode, setAIDifficulty, initializeGame } = useGameStore();

  const handleGameMode = (mode: 'online' | 'local' | 'ai') => {
    setGameMode(mode);
    if (mode === 'local') {
      initializeGame('local', ['Player 1', 'Player 2']);
      onPageChange('game');
    } else if (mode === 'ai') {
      initializeGame('ai', ['You', 'Computer']);
      onPageChange('game');
    } else {
      // Online mode - show matchmaking  
      onPageChange('matchmaking');
    }
  };

  const gameModes = [
    {
      id: 'online',
      title: 'Online Multiplayer',
      description: 'Play against players from around the world',
      icon: Globe,
      color: 'blue',
      features: ['Ranked matches', 'Real-time gameplay', 'Global leaderboard'],
    },
    {
      id: 'ai',
      title: 'vs Computer',
      description: 'Practice against AI opponents',
      icon: Cpu,
      color: 'green',
      features: ['3 difficulty levels', 'Perfect for practice', 'Instant games'],
    },
    {
      id: 'local',
      title: 'Local Multiplayer',
      description: 'Play with a friend on the same device',
      icon: Monitor,
      color: 'purple',
      features: ['Pass and play', 'No internet required', 'Perfect for teaching'],
    },
  ];

  const timeControls = [
    { name: 'Bullet', time: '1+0', icon: '⚡' },
    { name: 'Blitz', time: '3+0', icon: '🔥' },
    { name: 'Rapid', time: '10+0', icon: '⏰' },
    { name: 'Classical', time: '30+0', icon: '🏛️' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Your Game Mode
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Select how you'd like to play chess today
          </p>
        </div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`p-8 rounded-2xl transition-all cursor-pointer group hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                } shadow-xl`}
                onClick={() => handleGameMode(mode.id as any)}
              >
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform ${
                  mode.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  mode.color === 'green' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <Icon size={32} />
                </div>
                
                <h3 className={`text-2xl font-bold mb-3 text-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {mode.title}
                </h3>
                
                <p className={`text-center mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {mode.description}
                </p>
                
                <div className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        mode.color === 'blue' ? 'bg-blue-500' :
                        mode.color === 'green' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}></div>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Controls */}
        <div className={`p-8 rounded-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Clock className="inline mr-3" size={28} />
            Time Controls
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeControls.map((control) => (
              <button
                key={control.name}
                className={`p-4 rounded-xl transition-all hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-900'
                } shadow-lg`}
              >
                <div className="text-2xl mb-2">{control.icon}</div>
                <div className="font-semibold">{control.name}</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {control.time}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
      </div>
    </div>
  );
};