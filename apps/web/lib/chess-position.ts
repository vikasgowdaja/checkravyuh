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

export function fenToBoardFrame(
  fen: string,
  options?: {
    id?: string;
    label?: string;
    prompt?: string;
    narration?: string;
    movePlayed?: string;
    highlightSquares?: string[];
  }
): BoardFrame {
  const [placement] = fen.split(' ');

  if (!placement) {
    throw new Error('Invalid FEN: board placement is missing.');
  }

  const rows = placement.split('/');

  if (rows.length !== 8) {
    throw new Error('Invalid FEN: board placement must contain 8 ranks.');
  }

  const pieces: BoardPiece[] = [];

  rows.forEach((row, rankIndex) => {
    let filePointer = 0;
    const rank = 8 - rankIndex;

    for (const symbol of row) {
      const empty = Number(symbol);

      if (!Number.isNaN(empty)) {
        filePointer += empty;
        continue;
      }

      const color: BoardPiece['color'] = symbol === symbol.toUpperCase() ? 'white' : 'black';
      const normalized = symbol.toLowerCase();
      const kind =
        normalized === 'k'
          ? 'king'
          : normalized === 'q'
            ? 'queen'
            : normalized === 'r'
              ? 'rook'
              : normalized === 'b'
                ? 'bishop'
                : normalized === 'n'
                  ? 'knight'
                  : normalized === 'p'
                    ? 'pawn'
                    : null;

      if (!kind) {
        throw new Error(`Invalid FEN piece symbol: ${symbol}`);
      }

      const file = files[filePointer];

      if (!file) {
        throw new Error('Invalid FEN: file overflow while parsing rank.');
      }

      const square = `${file}${rank}`;

      pieces.push({
        id: `${color}-${kind}-${square}`,
        color,
        kind,
        square,
      });

      filePointer += 1;
    }

    if (filePointer !== 8) {
      throw new Error('Invalid FEN: rank does not resolve to 8 files.');
    }
  });

  return {
    id: options?.id ?? `fen-${placement}`,
    label: options?.label ?? 'Analysis position',
    prompt: options?.prompt ?? 'Inspect the current position.',
    movePlayed: options?.movePlayed,
    narration: options?.narration ?? 'Navigate, annotate, and analyze this position.',
    highlightSquares: options?.highlightSquares ?? [],
    pieces,
  };
}