import { Chess, type Move } from 'chess.js';

export type MoveGlyph = '!' | '!!' | '?' | '??' | '!?' | '?!';

export type MoveAnnotation = {
  moveId: string;
  glyph: MoveGlyph | null;
  comment: string;
};

export type BoardArrow = {
  from: string;
  to: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
};

export type BoardSquareHighlight = {
  square: string;
  color: 'yellow' | 'green' | 'red' | 'blue';
};

export type BoardDrawing = {
  positionIndex: number;
  arrows: BoardArrow[];
  highlights: BoardSquareHighlight[];
};

export type AnalysisMoveNode = {
  id: string;
  ply: number;
  moveNumber: number;
  color: 'white' | 'black';
  san: string;
  from: string;
  to: string;
  fenAfter: string;
  parentId: string | null;
  mainlineNextId: string | null;
  variations: string[];
  annotations: MoveAnnotation[];
};

export type AnalysisHeaders = {
  event: string;
  site: string;
  date: string;
  round: string;
  white: string;
  black: string;
  result: string;
};

export type AnalysisGame = {
  gameId: string;
  initialFen: string;
  positions: string[];
  moves: AnalysisMoveNode[];
  headers: AnalysisHeaders;
  termination: string;
};

export type GameAnalysisState = {
  gameId: string;
  currentMoveIndex: number;
  position: string;
  annotations: MoveAnnotation[];
  drawings: BoardDrawing[];
};

const DEFAULT_HEADERS: AnalysisHeaders = {
  event: 'Training Game',
  site: 'Checkravyuh',
  date: new Date().toISOString().slice(0, 10),
  round: '-',
  white: 'White',
  black: 'Black',
  result: '*',
};

function normalizeResultToken(value: string | undefined) {
  if (value === '1-0' || value === '0-1' || value === '1/2-1/2' || value === '*') {
    return value;
  }

  return '*';
}

function inferTermination(finalBoard: Chess) {
  if (finalBoard.isCheckmate()) {
    return 'Checkmate';
  }

  if (finalBoard.isStalemate()) {
    return 'Stalemate';
  }

  if (finalBoard.isThreefoldRepetition()) {
    return 'Threefold repetition';
  }

  if (finalBoard.isInsufficientMaterial()) {
    return 'Insufficient material';
  }

  if (finalBoard.isDrawByFiftyMoves()) {
    return '50-move rule';
  }

  if (finalBoard.isDraw()) {
    return 'Draw';
  }

  return 'Game finished';
}

function sanitizeComment(comment: string) {
  return comment.replace(/[{}]/g, '').trim();
}

export function clampMoveIndex(index: number, max: number) {
  if (!Number.isFinite(index)) {
    return 0;
  }

  return Math.max(0, Math.min(max, Math.trunc(index)));
}

export function getMoveForIndex(game: AnalysisGame, index: number) {
  if (index <= 0) {
    return null;
  }

  return game.moves[index - 1] ?? null;
}

export function parsePgnToAnalysisGame({
  gameId,
  pgn,
  startingFen,
  headers,
}: {
  gameId: string;
  pgn: string;
  startingFen?: string;
  headers?: Partial<AnalysisHeaders>;
}): AnalysisGame {
  const initialBoard = startingFen ? new Chess(startingFen) : new Chess();
  const requestedInitialFen = initialBoard.fen();

  const loader = new Chess(requestedInitialFen);
  loader.loadPgn(pgn, { strict: false });

  const history = loader.history({ verbose: true }) as Move[];
  const initialFen = history[0]?.before ?? requestedInitialFen;
  const replay = new Chess(initialFen);
  const positions = [initialFen];
  const moves: AnalysisMoveNode[] = [];

  history.forEach((verboseMove, index) => {
    const appliedMove = replay.move({
      from: verboseMove.from,
      to: verboseMove.to,
      promotion: verboseMove.promotion,
    });

    const fenAfter = appliedMove?.after ?? verboseMove.after ?? replay.fen();

    if (!appliedMove && verboseMove.after) {
      replay.load(verboseMove.after);
    }

    const moveId = `${gameId}-m${index + 1}`;

    moves.push({
      id: moveId,
      ply: index + 1,
      moveNumber: Math.ceil((index + 1) / 2),
      color: verboseMove.color === 'w' ? 'white' : 'black',
      san: verboseMove.san,
      from: verboseMove.from,
      to: verboseMove.to,
      fenAfter,
      parentId: index > 0 ? `${gameId}-m${index}` : null,
      mainlineNextId: null,
      variations: [],
      annotations: [],
    });

    positions.push(fenAfter);
  });

  moves.forEach((move, index) => {
    if (index < moves.length - 1) {
      move.mainlineNextId = moves[index + 1].id;
    }
  });

  const rawHeaders = loader.header();
  const resolvedHeaders: AnalysisHeaders = {
    ...DEFAULT_HEADERS,
    ...headers,
    event: headers?.event ?? rawHeaders.Event ?? DEFAULT_HEADERS.event,
    site: headers?.site ?? rawHeaders.Site ?? DEFAULT_HEADERS.site,
    date: headers?.date ?? rawHeaders.Date ?? DEFAULT_HEADERS.date,
    round: headers?.round ?? rawHeaders.Round ?? DEFAULT_HEADERS.round,
    white: headers?.white ?? rawHeaders.White ?? DEFAULT_HEADERS.white,
    black: headers?.black ?? rawHeaders.Black ?? DEFAULT_HEADERS.black,
    result: normalizeResultToken(headers?.result ?? rawHeaders.Result ?? undefined),
  };

  const gameResult = normalizeResultToken(rawHeaders.Result ?? undefined);

  if (resolvedHeaders.result === '*' && gameResult !== '*') {
    resolvedHeaders.result = gameResult;
  }

  const termination = inferTermination(loader);

  return {
    gameId,
    initialFen,
    positions,
    moves,
    headers: resolvedHeaders,
    termination,
  };
}

export function upsertMoveAnnotation({
  existing,
  moveId,
  glyph,
  comment,
}: {
  existing: MoveAnnotation[];
  moveId: string;
  glyph: MoveGlyph | null;
  comment: string;
}) {
  const sanitizedComment = sanitizeComment(comment);
  const next = existing.filter((entry) => entry.moveId !== moveId);

  if (!glyph && !sanitizedComment) {
    return next;
  }

  next.push({
    moveId,
    glyph,
    comment: sanitizedComment,
  });

  return next;
}

export function toggleSquareHighlight({
  drawing,
  square,
  color,
}: {
  drawing: BoardDrawing;
  square: string;
  color: BoardSquareHighlight['color'];
}) {
  const existing = drawing.highlights.find((entry) => entry.square === square);

  if (existing) {
    return {
      ...drawing,
      highlights: drawing.highlights.filter((entry) => entry.square !== square),
    };
  }

  return {
    ...drawing,
    highlights: [...drawing.highlights, { square, color }],
  };
}

export function upsertPositionDrawing({
  existing,
  positionIndex,
  updater,
}: {
  existing: BoardDrawing[];
  positionIndex: number;
  updater: (drawing: BoardDrawing) => BoardDrawing;
}) {
  const current = existing.find((entry) => entry.positionIndex === positionIndex) ?? {
    positionIndex,
    arrows: [],
    highlights: [],
  };
  const updated = updater(current);

  return [
    ...existing.filter((entry) => entry.positionIndex !== positionIndex),
    updated,
  ].sort((a, b) => a.positionIndex - b.positionIndex);
}

export function clearPositionDrawings(existing: BoardDrawing[], positionIndex: number) {
  return existing.filter((entry) => entry.positionIndex !== positionIndex);
}

export function getPositionDrawing(existing: BoardDrawing[], positionIndex: number) {
  return (
    existing.find((entry) => entry.positionIndex === positionIndex) ?? {
      positionIndex,
      arrows: [],
      highlights: [],
    }
  );
}

export function buildAnnotatedPgn({
  game,
  annotations,
}: {
  game: AnalysisGame;
  annotations: MoveAnnotation[];
}) {
  const annotationByMoveId = new Map(annotations.map((entry) => [entry.moveId, entry] as const));
  const lines = [
    `[Event "${game.headers.event}"]`,
    `[Site "${game.headers.site}"]`,
    `[Date "${game.headers.date}"]`,
    `[Round "${game.headers.round}"]`,
    `[White "${game.headers.white}"]`,
    `[Black "${game.headers.black}"]`,
    `[Result "${game.headers.result}"]`,
    '',
  ];

  const movetextTokens: string[] = [];

  game.moves.forEach((move) => {
    if (move.color === 'white') {
      movetextTokens.push(`${move.moveNumber}.`);
    }

    const annotation = annotationByMoveId.get(move.id);
    const glyph = annotation?.glyph ?? '';
    const token = `${move.san}${glyph}`;
    movetextTokens.push(token);

    if (annotation?.comment) {
      movetextTokens.push(`{${annotation.comment}}`);
    }
  });

  movetextTokens.push(game.headers.result);
  lines.push(movetextTokens.join(' '));
  return lines.join('\n');
}
