import React from 'react';
import { User, Trophy, Clock, Target, LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, theme, signIn, signOut, continueAsGuest } = useAuthStore();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen py-20 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-md mx-auto">
          <div className={`p-8 rounded-2xl shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <User size={32} />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome to ChessMaster
              </h1>
              <p className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sign in to save your games and track your progress
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={signIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-700 font-medium"
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <div className={`text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                or
              </div>

              <button
                onClick={continueAsGuest}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <LogIn size={20} />
                Continue as Guest
              </button>
            </div>

            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Why create an account?
              </h3>
              <ul className={`text-sm space-y-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>• Save and review your games</li>
                <li>• Track your progress and rating</li>
                <li>• Access game history and statistics</li>
                <li>• Sync across all your devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const calculateWinRate = () => {
    if (!user?.stats.totalGames) return '0%';
    const winRate = (user.stats.wins / user.stats.totalGames) * 100;
    return `${Math.round(winRate)}%`;
  };

  const stats = [
    { label: 'Rating', value: user?.stats.rating?.toString() || 'Unrated', icon: Trophy, color: 'amber' },
    { label: 'Games Played', value: user?.stats.totalGames?.toString() || '0', icon: Target, color: 'blue' },
    { label: 'Win Rate', value: calculateWinRate(), icon: Trophy, color: 'green' },
    { label: 'Total Wins', value: user?.stats.wins?.toString() || '0', icon: Clock, color: 'purple' },
  ];

  return (
    <div className={`min-h-screen py-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className={`p-8 rounded-2xl shadow-xl mb-8 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center gap-6">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <User size={32} />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {user?.displayName || 'Chess Player'}
              </h1>
              <p className={`mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {user?.email}
              </p>
              
              <button
                onClick={signOut}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`p-6 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                  stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <Icon size={24} />
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className={`p-8 rounded-2xl shadow-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Games
          </h2>
          
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>No games played yet</p>
            <p className="text-sm mt-2">Start playing to see your game history here</p>
          </div>
        </div>
      </div>
    </div>
  );
};