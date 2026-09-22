import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAnnotatedPgn,
  clampMoveIndex,
  parsePgnToAnalysisGame,
  upsertMoveAnnotation,
} from './analysis';

test('clampMoveIndex keeps index inside the valid range', () => {
  assert.equal(clampMoveIndex(-4, 18), 0);
  assert.equal(clampMoveIndex(7, 18), 7);
  assert.equal(clampMoveIndex(42, 18), 18);
});

test('parsePgnToAnalysisGame builds move snapshots and fens', () => {
  const game = parsePgnToAnalysisGame({
    gameId: 'demo',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6',
    headers: {
      white: 'A',
      black: 'B',
    },
  });

  assert.equal(game.moves.length, 6);
  assert.equal(game.positions.length, 7);
  assert.equal(game.moves[0].san, 'e4');
  assert.equal(game.moves[5].san, 'a6');
  assert.equal(game.moves[0].variations.length, 0);
  assert.ok(game.positions[0].includes(' w '));
});

test('buildAnnotatedPgn appends glyph and comments without mutating SAN', () => {
  const game = parsePgnToAnalysisGame({
    gameId: 'demo',
    pgn: '1. d4 d5 2. c4 e6',
    headers: {
      result: '1-0',
    },
  });

  const firstMove = game.moves[0];
  const annotations = upsertMoveAnnotation({
    existing: [],
    moveId: firstMove.id,
    glyph: '!',
    comment: 'Strong central space gain',
  });

  const exported = buildAnnotatedPgn({ game, annotations });

  assert.ok(exported.includes('d4!'));
  assert.ok(exported.includes('{Strong central space gain}'));
  assert.ok(exported.includes('[Result "1-0"]'));
});

test('parsePgnToAnalysisGame uses PGN history base when provided startingFen is midline', () => {
  const game = parsePgnToAnalysisGame({
    gameId: 'blackburne',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5',
    startingFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4',
  });

  assert.equal(game.moves[0].san, 'e4');
  assert.equal(game.moves[0].from, 'e2');
  assert.equal(game.moves[0].to, 'e4');
  assert.ok(game.initialFen.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'));
});
