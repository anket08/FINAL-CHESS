import React from 'react';
import { Play, Trophy, Clock, Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onPageChange }) => {
  const { user, theme } = useAuthStore();

  const features = [
    {
      icon: Users,
      title: 'Online Multiplayer',
      description: 'Challenge players worldwide with real-time gameplay',
      color: 'blue',
    },
    {
      icon: Play,
      title: 'AI Opponents',
      description: 'Practice against AI with multiple difficulty levels',
      color: 'green',
    },
    {
      icon: Clock,
      title: 'Time Controls',
      description: 'Various time formats from blitz to classical',
      color: 'amber',
    },
    {
      icon: Trophy,
      title: 'Game Analysis',
      description: 'Review your games and track your progress',
      color: 'purple',
    },
  ];

  // Remove static stats - will be replaced with real data when backend is connected

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
      } py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Master the Game of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                {' '}Chess
              </span>
            </h1>
            <p className={`text-xl mb-8 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Play chess online with friends, challenge AI opponents, and improve your skills 
              with our comprehensive chess platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onPageChange('play')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Start Playing
              </button>
              
              {!user && (
                <button
                  onClick={() => onPageChange('profile')}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}

      {/* Features Section */}
      <div className={`py-20 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-4xl font-bold text-center mb-16 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Everything You Need to Excel
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`p-6 rounded-xl transition-all hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } shadow-lg`}>
                  <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                    feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    feature.color === 'green' ? 'bg-green-100 text-green-600' :
                    feature.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};