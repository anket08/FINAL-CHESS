import { Chess } from 'chess.js';
import { AIDifficulty } from '../types/chess';

export class ChessAI {
  private difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  setDifficulty(difficulty: AIDifficulty) {
    this.difficulty = difficulty;
  }

  getBestMove(chess: Chess): string | null {
    const moves = chess.moves();
    if (moves.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(moves);
      case 'medium':
        return this.getMediumMove(chess);
      case 'hard':
        return this.getHardMove(chess);
      default:
        return this.getRandomMove(moves);
    }
  }

  private getRandomMove(moves: string[]): string {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private getMediumMove(chess: Chess): string {
    const moves = chess.moves({ verbose: true });
    
    // Prioritize captures
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)].san;
    }

    // Prioritize checks
    const checks = moves.filter(move => {
      chess.move(move);
      const isCheck = chess.inCheck();
      chess.undo();
      return isCheck;
    });
    
    if (checks.length > 0) {
      return checks[Math.floor(Math.random() * checks.length)].san;
    }

    // Random move otherwise
    return moves[Math.floor(Math.random() * moves.length)].san;
  }

  private getHardMove(chess: Chess): string {
    const result = this.minimax(chess, 3, -Infinity, Infinity, true);
    return result.move || this.getRandomMove(chess.moves());
  }

  private minimax(chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): { score: number; move?: string } {
    if (depth === 0 || chess.isGameOver()) {
      return { score: this.evaluatePosition(chess) };
    }

    const moves = chess.moves();
    let bestMove: string | undefined;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const score = this.minimax(chess, depth - 1, alpha, beta, false).score;
        chess.undo();

        if (score > maxScore) {
          maxScore = score;
          bestMove = move;
        }

        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        chess.move(move);
        const score = this.minimax(chess, depth - 1, alpha, beta, true).score;
        chess.undo();

        if (score < minScore) {
          minScore = score;
          bestMove = move;
        }

        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return { score: minScore, move: bestMove };
    }
  }

  private evaluatePosition(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === 'b' ? -1000 : 1000;
    }
    if (chess.isDraw()) return 0;

    let score = 0;
    const board = chess.board();

    const pieceValues: { [key: string]: number } = {
      'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': 0,
      'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0
    };

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const pieceKey = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
          score += pieceValues[pieceKey] || 0;
        }
      }
    }

    return score;
  }
}

export const chessAI = new ChessAI();