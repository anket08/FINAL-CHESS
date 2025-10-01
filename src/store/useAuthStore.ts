import { create } from 'zustand';
import { auth, onAuthStateChange, updateUserTheme } from '../services/firebase';
import { saveUserPreferences, getUserPreferences } from '../services/storageService';
import { User } from '../types/chess';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  updateUserStats: (stats: Partial<User['stats']>) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: 'dark',

  signIn: async () => {
    set({ isLoading: true });
    try {
      const { signInWithGoogle } = await import('../services/firebase');
      const user = await signInWithGoogle();
      if (user) {
        set({ user, isAuthenticated: true, theme: user.theme });
        await saveUserPreferences(user);
      } else {
        throw new Error('Firebase authentication not available');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed. Please try again or continue as guest.');
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { user } = get();
      set({ user: null, isAuthenticated: false });
      // Remove user-specific preferences
      if (user?.uid) {
        localStorage.removeItem(`chess_user_preferences_${user.uid}`);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  continueAsGuest: () => {
    const guestUser: User = {
      uid: `guest_${Date.now()}`,
      displayName: 'Guest Player',
      email: '',
      theme: 'dark',
      isGuest: true,
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
      },
    };
    set({ user: guestUser, isAuthenticated: true });
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      theme: user?.theme || 'dark',
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  toggleTheme: () => {
    const { user, theme } = get();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    set({ theme: newTheme });
    
    if (user) {
      const updatedUser = { ...user, theme: newTheme };
      set({
        user: updatedUser,
      });
      
      // Update in Firebase if not guest
      if (!user.isGuest) {
        updateUserTheme(user.uid, newTheme);
      }
      
      // Save preferences locally
      saveUserPreferences(updatedUser);
    }
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  },

  updateUserStats: (stats: Partial<User['stats']>) => {
    const { user } = get();
    if (user) {
      const updatedStats = {
        wins: (user.stats.wins || 0) + (stats.wins || 0),
        losses: (user.stats.losses || 0) + (stats.losses || 0),
        draws: (user.stats.draws || 0) + (stats.draws || 0),
        totalGames: (user.stats.totalGames || 0) + (stats.totalGames || 0),
        rating: user.stats.rating,
      };
      
      const updatedUser = {
        ...user,
        stats: updatedStats,
      };
      
      set({
        user: {
          ...user,
          stats: updatedStats,
        },
      });
      
      // Save updated user preferences
      saveUserPreferences(updatedUser);
    }
  },

  initializeAuth: () => {
    set({ isLoading: true });
    
    // Load saved preferences - will use fallback for backward compatibility
    getUserPreferences().then(preferences => {
      if (preferences) {
        set({ theme: preferences.theme });
        document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
      }
      set({ isLoading: false });
    });

    // Don't automatically sign in - wait for user action
  },
}));