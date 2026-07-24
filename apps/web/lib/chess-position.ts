import { Chess } from 'chess.js';

import type { BoardFrame, BoardPiece } from './api';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const ranks = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const pieceToFenSymbol: Record<BoardPiece['kind'], string> = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k',
};

function buildBoardMap(pieces: BoardPiece[]) {
  return new Map(pieces.map((piece) => [piece.square, piece]));
}

function inferCastlingRights(pieces: BoardPiece[]) {
  const boardMap = buildBoardMap(pieces);
  let rights = '';

  const whiteKing = boardMap.get('e1');

  if (whiteKing?.kind === 'king' && whiteKing.color === 'white') {
    const kingSideRook = boardMap.get('h1');
    const queenSideRook = boardMap.get('a1');

    if (kingSideRook?.kind === 'rook' && kingSideRook.color === 'white') {
      rights += 'K';
    }

    if (queenSideRook?.kind === 'rook' && queenSideRook.color === 'white') {
      rights += 'Q';
    }
  }

  const blackKing = boardMap.get('e8');

  if (blackKing?.kind === 'king' && blackKing.color === 'black') {
    const kingSideRook = boardMap.get('h8');
    const queenSideRook = boardMap.get('a8');

    if (kingSideRook?.kind === 'rook' && kingSideRook.color === 'black') {
      rights += 'k';
    }

    if (queenSideRook?.kind === 'rook' && queenSideRook.color === 'black') {
      rights += 'q';
    }
  }

  return rights || '-';
}

function inferEnPassantSquare(frame: BoardFrame) {
  const highlightSquares = frame.highlightSquares ?? [];

  if (highlightSquares.length < 2) {
    return '-';
  }

  const [fromSquare, toSquare] = highlightSquares;

  if (!fromSquare || !toSquare || fromSquare[0] !== toSquare[0]) {
    return '-';
  }

  const movingPiece = frame.pieces.find((piece) => piece.square === toSquare);

  if (!movingPiece || movingPiece.kind !== 'pawn') {
    return '-';
  }

  const fromRank = Number(fromSquare[1]);
  const toRank = Number(toSquare[1]);

  if (Math.abs(fromRank - toRank) !== 2) {
    return '-';
  }

  return `${fromSquare[0]}${(fromRank + toRank) / 2}`;
}

export function boardFrameToFen(frame: BoardFrame, activeColor: 'white' | 'black') {
  const boardMap = buildBoardMap(frame.pieces);

  const ranksEncoded = ranks.map((rank) => {
    let row = '';
    let emptySquares = 0;

    files.forEach((file) => {
      const piece = boardMap.get(`${file}${rank}`);

      if (!piece) {
        emptySquares += 1;
        return;
      }

      if (emptySquares > 0) {
        row += String(emptySquares);
        emptySquares = 0;
      }

      const symbol = pieceToFenSymbol[piece.kind];
      row += piece.color === 'white' ? symbol.toUpperCase() : symbol;
    });

    if (emptySquares > 0) {
      row += String(emptySquares);
    }

    return row;
  });

  return `${ranksEncoded.join('/')} ${activeColor === 'white' ? 'w' : 'b'} ${inferCastlingRights(
    frame.pieces
  )} ${inferEnPassantSquare(frame)} 0 1`;
}

export function createChessFromFrame(frame: BoardFrame, activeColor: 'white' | 'black') {
  return new Chess(boardFrameToFen(frame, activeColor));
}