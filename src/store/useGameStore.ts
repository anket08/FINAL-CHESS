import { create } from 'zustand';
import { Chess } from 'chess.js';
import { createGame, updateGame, subscribeToGame } from '../services/firebase';
import { chessAI } from '../services/aiService';
import { saveGameOffline } from '../services/storageService';
import { GameState, GameMode, AIDifficulty, User } from '../types/chess';

interface GameStore {
  // Game state
  currentGame: GameState | null;
  chess: Chess;
  selectedSquare: string | null;
  validMoves: string[];
  gameMode: GameMode | null;
  aiDifficulty: AIDifficulty;
  
  // Timer state
  whiteTime: number;
  blackTime: number;
  timerInterval: NodeJS.Timeout | null;
  isTimerRunning: boolean;
  
  // UI state
  showMoveList: boolean;
  showSettings: boolean;
  isOnlineGame: boolean;
  gameSubscription: (() => void) | null;
  
  // Actions
  initializeGame: (mode: GameMode, players: string[]) => void;
  initializeOnlineGame: (gameId: string) => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  makeMoveOnline: (from: string, to: string, promotion?: string) => Promise<boolean>;
  selectSquare: (square: string) => Promise<void>;
  resetGame: () => void;
  setGameMode: (mode: GameMode) => void;
  setAIDifficulty: (difficulty: AIDifficulty) => void;
  toggleMoveList: () => void;
  toggleSettings: () => void;
  loadGameState: (gameState: GameState) => void;
  finishGame: (result: GameState['result'], winnerUid?: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateTimer: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentGame: null,
  chess: new Chess(),
  selectedSquare: null,
  validMoves: [],
  gameMode: null,
  aiDifficulty: 'medium',
  whiteTime: 600, // 10 minutes in seconds
  blackTime: 600, // 10 minutes in seconds
  timerInterval: null,
  isTimerRunning: false,
  showMoveList: false,
  showSettings: false,
  isOnlineGame: false,
  gameSubscription: null,

  initializeGame: (mode: GameMode, players: string[]) => {
    const chess = new Chess();
    const initialTime = 600; // 10 minutes
    const gameState: GameState = {
      id: crypto.randomUUID(),
      mode,
      status: 'active',
      createdAt: Date.now(),
      playersUids: players,
      playerNames: players,
      moves: [],
      currentPlayer: 'white',
      timeControl: {
        initial: initialTime,
        increment: 0,
        whiteTime: initialTime,
        blackTime: initialTime,
      },
    };
    
    set({
      currentGame: gameState,
      chess,
      gameMode: mode,
      isOnlineGame: false,
      selectedSquare: null,
      validMoves: [],
      whiteTime: initialTime,
      blackTime: initialTime,
    });
    
    // Start timer for active games
    get().startTimer();
  },

  initializeOnlineGame: async (gameId: string) => {
    const { gameSubscription } = get();
    
    // Clean up existing subscription
    if (gameSubscription) {
      gameSubscription();
    }
    
    // Subscribe to game updates
    const unsubscribe = subscribeToGame(gameId, (gameState) => {
      if (gameState) {
        const chess = new Chess();
        gameState.moves.forEach(move => chess.move(move));
        
        set({
          currentGame: gameState,
          chess,
          isOnlineGame: true,
          selectedSquare: null,
          validMoves: [],
        });
      }
    });
    
    set({ gameSubscription: unsubscribe });
  },

  makeMove: (from: string, to: string, promotion?: string) => {
    const { chess, currentGame, gameMode, aiDifficulty } = get();
    if (!currentGame) return false;

    try {
      const move = chess.move({ from, to, promotion });
      if (move) {
        const updatedMoves = [...currentGame.moves, move.san];
        const newCurrentPlayer = chess.turn() === 'w' ? 'white' : 'black';
        
        // Check if game is finished and update stats
        let gameResult = undefined;
        let gameFinished = false;
        if (chess.isGameOver()) {
          gameFinished = true;
          if (chess.isCheckmate()) {
            gameResult = chess.turn() === 'w' ? 'black-wins' : 'white-wins';
          } else {
            gameResult = 'draw';
          }
        }
        
        // Update time control
        const { whiteTime, blackTime } = get();
        const updatedTimeControl = currentGame.timeControl ? {
          ...currentGame.timeControl,
          whiteTime: currentGame.currentPlayer === 'white' ? whiteTime : currentGame.timeControl.whiteTime,
          blackTime: currentGame.currentPlayer === 'black' ? blackTime : currentGame.timeControl.blackTime,
        } : undefined;
        
        set({
          currentGame: {
            ...currentGame,
            moves: updatedMoves,
            currentPlayer: newCurrentPlayer,
            status: gameFinished ? 'finished' : 'active',
            result: gameResult,
            endedAt: gameFinished ? Date.now() : undefined,
            timeControl: updatedTimeControl,
          },
          selectedSquare: null,
          validMoves: [],
        });
        
        // Stop timer if game finished
        if (gameFinished) {
          get().stopTimer();
        }
        
        // Update user stats if game is finished
        if (gameFinished && gameResult) {
          get().finishGame(gameResult);
        }
        
        // Save game offline
        const updatedGame = get().currentGame;
        if (updatedGame) {
          saveGameOffline(updatedGame);
        }
        
        // AI move for AI mode
        if (gameMode === 'ai' && newCurrentPlayer === 'black' && !gameFinished) {
          setTimeout(() => {
            chessAI.setDifficulty(aiDifficulty);
            const aiMove = chessAI.getBestMove(chess);
            if (aiMove) {
              // Parse the move properly
              try {
                const moveObj = chess.moves({ verbose: true }).find(m => m.san === aiMove);
                if (moveObj) {
                  get().makeMove(moveObj.from, moveObj.to, moveObj.promotion);
                }
              } catch (error) {
                console.error('AI move error:', error);
              }
            }
          }, 500);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return false;
  },

  makeMoveOnline: async (from: string, to: string, promotion?: string) => {
    const { chess, currentGame } = get();
    if (!currentGame || !currentGame.id) return false;

    try {
      const move = chess.move({ from, to, promotion });
      if (move) {
        const updatedMoves = [...currentGame.moves, move.san];
        const newCurrentPlayer = chess.turn() === 'w' ? 'white' : 'black';
        
        const updates: Partial<GameState> = {
          moves: updatedMoves,
          currentPlayer: newCurrentPlayer,
        };
        
        if (chess.isGameOver()) {
          updates.status = 'finished';
          updates.result = chess.isCheckmate() ? 
            (chess.turn() === 'w' ? 'black-wins' : 'white-wins') : 
            'draw';
          updates.endedAt = Date.now();
        }
        
        await updateGame(currentGame.id, updates);
        return true;
      }
    } catch (error) {
      console.error('Invalid online move:', error);
    }
    
    return false;
  },
  selectSquare: async (square: string) => {
    const { chess, selectedSquare, isOnlineGame } = get();
    
    if (selectedSquare === square) {
      set({ selectedSquare: null, validMoves: [] });
      return;
    }

    if (selectedSquare) {
      // Try to make a move
      const moveSuccessful = isOnlineGame 
        ? await get().makeMoveOnline(selectedSquare, square)
        : get().makeMove(selectedSquare, square);
      if (moveSuccessful) {
        return;
      }
    }

    // Select new square and get valid moves
    const moves = chess.moves({ square, verbose: true });
    const validMoves = moves.map(move => move.to);
    
    set({
      selectedSquare: square,
      validMoves,
    });
  },

  resetGame: () => {
    const { gameSubscription } = get();
    
    // Stop timer
    get().stopTimer();
    
    // Clean up subscription
    if (gameSubscription) {
      gameSubscription();
    }
    
    set({
      currentGame: null,
      chess: new Chess(),
      selectedSquare: null,
      validMoves: [],
      gameMode: null,
      isOnlineGame: false,
      gameSubscription: null,
      whiteTime: 600,
      blackTime: 600,
      isTimerRunning: false,
    });
  },

  setGameMode: (mode: GameMode) => set({ gameMode: mode }),
  setAIDifficulty: (difficulty: AIDifficulty) => set({ aiDifficulty: difficulty }),
  toggleMoveList: () => set((state) => ({ showMoveList: !state.showMoveList })),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),

  loadGameState: (gameState: GameState) => {
    const chess = new Chess();
    gameState.moves.forEach(move => chess.move(move));
    
    set({
      currentGame: gameState,
      chess,
      selectedSquare: null,
      validMoves: [],
    });
  },

  updateUserStats: (stats: Partial<User['stats']>) => {
    // This will be handled by the auth store
    const { useAuthStore } = require('./useAuthStore');
    const authStore = useAuthStore.getState();
    if (authStore.updateUserStats) {
      authStore.updateUserStats(stats);
    }
  },

  finishGame: async (result: GameState['result'], winnerUid?: string) => {
    const { currentGame, isOnlineGame } = get();
    if (!currentGame) return;
    
    const updates: Partial<GameState> = {
      status: 'finished',
      result,
      winnerUid,
      endedAt: Date.now(),
    };
    
    // Update the current game state immediately
    const updatedGame = { ...currentGame, ...updates };
    set({ currentGame: updatedGame });
    
    // Update user stats based on result (for local/AI games, player is always white)
    const { useAuthStore } = await import('./useAuthStore');
    const { updateUserStats } = useAuthStore.getState();
    
    if (currentGame.mode === 'ai' || currentGame.mode === 'local') {
      if (result === 'white-wins') {
        updateUserStats({ wins: 1, totalGames: 1 });
      } else if (result === 'black-wins') {
        updateUserStats({ losses: 1, totalGames: 1 });
      } else if (result === 'draw') {
        updateUserStats({ draws: 1, totalGames: 1 });
      }
    }
    
    if (isOnlineGame && currentGame.id) {
      await updateGame(currentGame.id, updates);
    } else {
      await saveGameOffline(updatedGame);
    }
  },

  startTimer: () => {
    const { timerInterval } = get();
    
    // Clear existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    const interval = setInterval(() => {
      get().updateTimer();
    }, 1000);
    
    set({ 
      timerInterval: interval,
      isTimerRunning: true,
    });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    set({ 
      timerInterval: null,
      isTimerRunning: false,
    });
  },

  updateTimer: () => {
    const { currentGame, whiteTime, blackTime, isTimerRunning } = get();
    
    if (!currentGame || currentGame.status !== 'active' || !isTimerRunning) {
      return;
    }
    
    const currentPlayer = currentGame.currentPlayer;
    
    if (currentPlayer === 'white' && whiteTime > 0) {
      const newWhiteTime = whiteTime - 1;
      set({ whiteTime: newWhiteTime });
      
      if (newWhiteTime <= 0) {
        get().finishGame('black-wins');
      }
    } else if (currentPlayer === 'black' && blackTime > 0) {
      const newBlackTime = blackTime - 1;
      set({ blackTime: newBlackTime });
      
      if (newBlackTime <= 0) {
        get().finishGame('white-wins');
      }
    }
  },
}));