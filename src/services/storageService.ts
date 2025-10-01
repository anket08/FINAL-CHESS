import localforage from 'localforage';
import { GameState, User } from '../types/chess';

// Configure localforage
localforage.config({
  name: 'ChessMaster',
  version: 1.0,
  storeName: 'chess_games',
  description: 'Chess game offline storage'
});

export const saveGameOffline = async (game: GameState): Promise<void> => {
  try {
    // Get current user ID from auth store
    const { useAuthStore } = await import('../store/useAuthStore');
    const { user } = useAuthStore.getState();
    const userId = user?.uid || 'anonymous';
    
    await localforage.setItem(`game_${userId}_${game.id}`, game);
  } catch (error) {
    console.error('Error saving game offline:', error);
  }
};

export const getOfflineGames = async (userId?: string): Promise<GameState[]> => {
  try {
    // Get current user ID if not provided
    if (!userId) {
      const { useAuthStore } = await import('../store/useAuthStore');
      const { user } = useAuthStore.getState();
      userId = user?.uid || 'anonymous';
    }
    
    const games: GameState[] = [];
    await localforage.iterate((value: GameState, key: string) => {
      if (key.startsWith(`game_${userId}_`)) {
        games.push(value);
      }
    });
    return games.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting offline games:', error);
    return [];
  }
};

export const removeOfflineGame = async (gameId: string): Promise<void> => {
  try {
    // Get current user ID from auth store
    const { useAuthStore } = await import('../store/useAuthStore');
    const { user } = useAuthStore.getState();
    const userId = user?.uid || 'anonymous';
    
    await localforage.removeItem(`game_${userId}_${gameId}`);
  } catch (error) {
    console.error('Error removing offline game:', error);
  }
};

export const saveUserPreferences = async (user: User): Promise<void> => {
  try {
    const preferences = {
      theme: user.theme,
      uid: user.uid,
      stats: user.stats
    };
    await localforage.setItem(`user_preferences_${user.uid}`, preferences);
    // Also save to localStorage as backup
    localStorage.setItem(`chess_user_preferences_${user.uid}`, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

export const getUserPreferences = async (userId?: string): Promise<{ theme: 'light' | 'dark'; uid?: string; stats?: User['stats'] } | null> => {
  try {
    if (!userId) {
      // Try to get from current auth state
      const { useAuthStore } = await import('../store/useAuthStore');
      const { user } = useAuthStore.getState();
      userId = user?.uid;
    }
    
    if (!userId) {
      // Fallback to old format for backward compatibility
      let preferences = await localforage.getItem('user_preferences');
      if (!preferences) {
        const localData = localStorage.getItem('chess_user_preferences');
        if (localData) {
          preferences = JSON.parse(localData);
        }
      }
      return preferences as any;
    }
    
    let preferences = await localforage.getItem(`user_preferences_${userId}`);
    if (!preferences) {
      // Try localStorage as backup
      const localData = localStorage.getItem(`chess_user_preferences_${userId}`);
      if (localData) {
        preferences = JSON.parse(localData);
      }
    }
    return preferences as any;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};