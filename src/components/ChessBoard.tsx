import React, { useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';

interface ChessBoardProps {
  orientation?: 'white' | 'black';
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  orientation = 'white',
  disabled = false 
}) => {
  const { chess, selectedSquare, validMoves, makeMove, selectSquare } = useGameStore();
  const { theme } = useAuthStore();

  const onSquareClick = useCallback(async (square: string) => {
    if (disabled) return;
    await selectSquare(square);
  }, [disabled, selectSquare]);

  const onPieceDrop = useCallback(async (sourceSquare: string, targetSquare: string, piece: string) => {
    if (disabled) return false;
    
    const { isOnlineGame, makeMove, makeMoveOnline } = useGameStore.getState();
    
    // Handle pawn promotion
    const move = chess.moves({ square: sourceSquare, verbose: true })
      .find(m => m.to === targetSquare);
    
    if (move && move.promotion) {
      // For now, always promote to queen
      return isOnlineGame 
        ? await makeMoveOnline(sourceSquare, targetSquare, 'q')
        : makeMove(sourceSquare, targetSquare, 'q');
    }
    
    return isOnlineGame 
      ? await makeMoveOnline(sourceSquare, targetSquare)
      : makeMove(sourceSquare, targetSquare);
  }, [chess, disabled]);

  const customSquareStyles = React.useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};
    
    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 0, 0.4)' : 'rgba(255, 255, 0, 0.6)',
      };
    }
    
    // Highlight valid moves
    validMoves.forEach(square => {
      styles[square] = {
        background: `radial-gradient(circle, ${
          theme === 'dark' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.5)'
        } 25%, transparent 25%)`,
      };
    });
    
    return styles;
  }, [selectedSquare, validMoves, theme]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <Chessboard
        position={chess.fen()}
        onSquareClick={onSquareClick}
        onPieceDrop={onPieceDrop}
        boardOrientation={orientation}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: theme === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.6)' 
            : '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        customDarkSquareStyle={{
          backgroundColor: theme === 'dark' ? '#769656' : '#8CA2AD',
        }}
        customLightSquareStyle={{
          backgroundColor: theme === 'dark' ? '#EEEED2' : '#F0F8F0',
        }}
        arePiecesDraggable={!disabled}
        areSquareResizeable={false}
      />
    </div>
  );
};