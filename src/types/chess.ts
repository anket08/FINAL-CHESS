export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  theme: 'light' | 'dark';
  stats: UserStats;
  isGuest?: boolean;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  rating?: number;
}

export interface GameState {
  id: string;
  mode: GameMode;
  status: GameStatus;
  createdAt: number;
  endedAt?: number;
  playersUids: string[];
  playerNames: string[];
  moves: string[]; // PGN moves
  result?: GameResult;
  winnerUid?: string;
  batchId?: string;
  currentPlayer: 'white' | 'black';
  timeControl?: TimeControl;
  roomCode?: string;
}

export interface GameBatch {
  id: string;
  ownerUid: string;
  games: string[];
  summary: BatchSummary;
  createdAt: number;
}

export interface BatchSummary {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  avgMoves: number;
  duration: number;
}

export interface TimeControl {
  initial: number; // seconds
  increment: number; // seconds per move
  whiteTime: number;
  blackTime: number;
}

export type GameMode = 'online' | 'local' | 'ai';
export type GameStatus = 'waiting' | 'active' | 'finished' | 'abandoned';
export type GameResult = 'white-wins' | 'black-wins' | 'draw' | 'abandoned';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  timestamp: number;
}

export interface GameRoom {
  id: string;
  code: string;
  hostUid: string;
  guestUid?: string;
  gameId?: string;
  createdAt: number;
  status: 'waiting' | 'active' | 'finished';
}