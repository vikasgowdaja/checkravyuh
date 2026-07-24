import {
  getTrapById,
  LessonStep,
  PieceRecord,
  PracticeFrame,
  TrapRecord,
  traps,
} from './training-catalog';

type PieceKind = PieceRecord['kind'];
type MoveSide = 'white' | 'black';
type TrainingMode = 'tour' | 'practice';

type SecondaryMove = {
  piece: PieceKind;
  from: string;
  to: string;
  capturedSquare?: string;
};

type ScriptedMove = {
  id: string;
  side: MoveSide;
  san: string;
  piece: PieceKind;
  from: string;
  to: string;
  explanation: string;
  prompt?: string;
  hint?: string;
  options?: string[];
  capturedSquare?: string;
  secondaryMove?: SecondaryMove;
};

export type GuidedTurn = {
  id: string;
  turnNumber: number;
  whiteMove: string;
  correctMove: string;
  prompt: string;
  hint: string;
  explanation: string;
  options: string[];
  boardBefore: PracticeFrame;
  boardAfter: PracticeFrame;
};

export type TrapTrainingRecord = {
  id: string;
  watch: PracticeFrame[];
  tour: GuidedTurn[];
  practice: GuidedTurn[];
};

export type TrapTrainingResponse = {
  trapId: string;
  title: string;
  watch: {
    frames: PracticeFrame[];
  };
  tour: {
    supported: true;
    turns: GuidedTurn[];
  };
  practice: {
    supported: true;
    turns: GuidedTurn[];
  };
};

export type MoveValidationResponse = {
  correct: boolean;
  expectedMove: string;
  feedback: string;
  hint?: string;
  boardAfter?: PracticeFrame;
  isComplete: boolean;
};

type TrapScriptDefinition = {
  trapId: string;
  moves: ScriptedMove[];
};

type MoveConfig = Omit<ScriptedMove, 'side'>;

function whiteMove(config: MoveConfig): ScriptedMove {
  return {
    side: 'white',
    ...config,
  };
}

function blackMove(config: MoveConfig): ScriptedMove {
  return {
    side: 'black',
    ...config,
  };
}

function createStartingPieces(): PieceRecord[] {
  const pieces: PieceRecord[] = [];

  const whiteBackRank: Array<{ kind: PieceKind; square: string; id: string }> = [
    { id: 'wr-a', kind: 'rook', square: 'a1' },
    { id: 'wn-b', kind: 'knight', square: 'b1' },
    { id: 'wb-c', kind: 'bishop', square: 'c1' },
    { id: 'wq', kind: 'queen', square: 'd1' },
    { id: 'wk', kind: 'king', square: 'e1' },
    { id: 'wb-f', kind: 'bishop', square: 'f1' },
    { id: 'wn-g', kind: 'knight', square: 'g1' },
    { id: 'wr-h', kind: 'rook', square: 'h1' },
  ];

  const blackBackRank: Array<{ kind: PieceKind; square: string; id: string }> = [
    { id: 'br-a', kind: 'rook', square: 'a8' },
    { id: 'bn-b', kind: 'knight', square: 'b8' },
    { id: 'bb-c', kind: 'bishop', square: 'c8' },
    { id: 'bq', kind: 'queen', square: 'd8' },
    { id: 'bk', kind: 'king', square: 'e8' },
    { id: 'bb-f', kind: 'bishop', square: 'f8' },
    { id: 'bn-g', kind: 'knight', square: 'g8' },
    { id: 'br-h', kind: 'rook', square: 'h8' },
  ];

  whiteBackRank.forEach((piece) => {
    pieces.push({ ...piece, color: 'white' });
  });
  blackBackRank.forEach((piece) => {
    pieces.push({ ...piece, color: 'black' });
  });

  'abcdefgh'.split('').forEach((file) => {
    pieces.push({ id: `wp-${file}`, kind: 'pawn', color: 'white', square: `${file}2` });
    pieces.push({ id: `bp-${file}`, kind: 'pawn', color: 'black', square: `${file}7` });
  });

  return pieces;
}

function clonePieces(pieces: PieceRecord[]) {
  return pieces.map((piece) => ({ ...piece }));
}

function applyMove(pieces: PieceRecord[], move: ScriptedMove): PieceRecord[] {
  const nextPieces = clonePieces(pieces);
  const movingPiece = nextPieces.find((piece) => piece.square === move.from && piece.color === move.side);

  if (!movingPiece) {
    throw new Error(`Unable to find ${move.side} piece on ${move.from} for ${move.san}.`);
  }

  const capturedSquare = move.capturedSquare ?? move.to;
  const capturedIndex = nextPieces.findIndex(
    (piece) => piece.square === capturedSquare && piece.color !== move.side
  );

  if (capturedIndex >= 0) {
    nextPieces.splice(capturedIndex, 1);
  }

  movingPiece.square = move.to;

  if (move.secondaryMove) {
    const supportingPiece = nextPieces.find(
      (piece) => piece.square === move.secondaryMove?.from && piece.color === move.side
    );

    if (!supportingPiece) {
      throw new Error(`Unable to find supporting piece on ${move.secondaryMove.from} for ${move.san}.`);
    }

    const secondaryCaptureSquare = move.secondaryMove.capturedSquare ?? move.secondaryMove.to;
    const secondaryCaptureIndex = nextPieces.findIndex(
      (piece) => piece.square === secondaryCaptureSquare && piece.color !== move.side
    );

    if (secondaryCaptureIndex >= 0) {
      nextPieces.splice(secondaryCaptureIndex, 1);
    }

    supportingPiece.square = move.secondaryMove.to;
  }

  return nextPieces;
}

function createWatchFrame(index: number, move: ScriptedMove, pieces: PieceRecord[]): PracticeFrame {
  const actor = move.side === 'white' ? 'White' : 'Black';

  return {
    id: `watch-${move.id}`,
    label: `Move ${index + 1}`,
    prompt: `${actor} plays ${move.san}`,
    movePlayed: move.san,
    narration: move.explanation,
    highlightSquares: [move.from, move.to],
    pieces,
  };
}

function createBoardSnapshot(
  id: string,
  label: string,
  prompt: string,
  narration: string,
  movePlayed: string,
  highlightSquares: string[],
  pieces: PieceRecord[]
): PracticeFrame {
  return {
    id,
    label,
    prompt,
    movePlayed,
    narration,
    highlightSquares,
    pieces,
  };
}

function buildWatchFrames(moves: ScriptedMove[]) {
  let board = createStartingPieces();

  return moves.map((move, index) => {
    board = applyMove(board, move);
    return createWatchFrame(index, move, board);
  });
}

function buildGuidedTurns(moves: ScriptedMove[]) {
  let board = createStartingPieces();
  const turns: GuidedTurn[] = [];
  let currentWhiteMove: ScriptedMove | null = null;
  let turnNumber = 1;

  moves.forEach((move) => {
    board = applyMove(board, move);

    if (move.side === 'white') {
      currentWhiteMove = move;
      return;
    }

    if (!currentWhiteMove || !move.prompt || !move.hint || !move.options) {
      throw new Error(`Missing guided metadata for ${move.san}.`);
    }

    const boardAfter = clonePieces(board);
    const boardBefore = buildBoardBefore(moves, turnNumber, move.id);

    turns.push({
      id: `turn-${turnNumber}`,
      turnNumber,
      whiteMove: currentWhiteMove.san,
      correctMove: move.san,
      prompt: move.prompt,
      hint: move.hint,
      explanation: move.explanation,
      options: move.options,
      boardBefore: createBoardSnapshot(
        `before-${move.id}`,
        `Turn ${turnNumber}`,
        move.prompt,
        currentWhiteMove.explanation,
        currentWhiteMove.san,
        [currentWhiteMove.from, currentWhiteMove.to],
        boardBefore
      ),
      boardAfter: createBoardSnapshot(
        `after-${move.id}`,
        `Turn ${turnNumber}`,
        `${move.san}`,
        move.explanation,
        move.san,
        [move.from, move.to],
        boardAfter
      ),
    });
    turnNumber += 1;
  });

  return turns;
}

function buildBoardBefore(moves: ScriptedMove[], turnNumber: number, blackMoveId: string) {
  let board = createStartingPieces();
  let currentTurn = 1;

  for (const move of moves) {
    board = applyMove(board, move);

    if (move.id === blackMoveId) {
      break;
    }

    if (move.side === 'black') {
      currentTurn += 1;
      continue;
    }

    if (currentTurn === turnNumber) {
      return clonePieces(board);
    }
  }

  return clonePieces(board);
}

function buildLessonSteps(trap: TrapRecord, turns: GuidedTurn[]): LessonStep[] {
  const sequenceSteps = turns.slice(0, 4).map((turn, index) => ({
    stepNumber: index + 3,
    title: `Play ${turn.correctMove}`,
    content: turn.explanation,
    hint: turn.hint,
  }));

  return [
    {
      stepNumber: 1,
      title: 'Overview',
      content: trap.overview,
    },
    {
      stepNumber: 2,
      title: 'Trigger',
      content: trap.whenItWorks,
      hint: trap.warning,
    },
    ...sequenceSteps,
    {
      stepNumber: sequenceSteps.length + 3,
      title: 'Review',
      content: `Remember the finish: ${turns[turns.length - 1]?.correctMove ?? trap.winningContinuation[0]}. ${trap.idea}`,
    },
  ];
}

function normalizeMove(move: string) {
  return move.replace(/[!?+#]/g, '').replace(/\s+/g, '').toLowerCase();
}

function buildTrainingRecord(definition: TrapScriptDefinition): TrapTrainingRecord {
  const watch = buildWatchFrames(definition.moves);
  const turns = buildGuidedTurns(definition.moves);

  return {
    id: definition.trapId,
    watch,
    tour: turns,
    practice: turns,
  };
}

const trainingDefinitions: TrapScriptDefinition[] = [
  {
    trapId: 'blackburne_shilling',
    moves: [
      whiteMove({
        id: 'bs-1w',
        san: 'e4',
        piece: 'pawn',
        from: 'e2',
        to: 'e4',
        explanation: 'White claims the center and invites an open game.',
      }),
      blackMove({
        id: 'bs-1b',
        san: 'e5',
        piece: 'pawn',
        from: 'e7',
        to: 'e5',
        explanation: 'Black mirrors the center and opens lines for the queen and bishop.',
        prompt: 'White plays e4. How do you answer in the center?',
        hint: 'Mirror White and open your dark-squared bishop.',
        options: ['e5', 'c6', 'Nf6'],
      }),
      whiteMove({
        id: 'bs-2w',
        san: 'Nf3',
        piece: 'knight',
        from: 'g1',
        to: 'f3',
        explanation: 'White develops naturally and eyes the e5 pawn.',
      }),
      blackMove({
        id: 'bs-2b',
        san: 'Nc6',
        piece: 'knight',
        from: 'b8',
        to: 'c6',
        explanation: 'Nc6 reinforces e5 and prepares the tactical jump to d4.',
        prompt: 'White develops the king knight. Which move supports e5 and speeds development?',
        hint: 'Develop the queenside knight toward the center.',
        options: ['Nc6', 'd6', 'Bc5'],
      }),
      whiteMove({
        id: 'bs-3w',
        san: 'Bc4',
        piece: 'bishop',
        from: 'f1',
        to: 'c4',
        explanation: 'White aims at f7 and leaves the knight on f3 exposed to tactics.',
      }),
      blackMove({
        id: 'bs-3b',
        san: 'Nd4!',
        piece: 'knight',
        from: 'c6',
        to: 'd4',
        explanation: 'The knight jump attacks c2 and baits the greedy capture on e5.',
        prompt: 'White points the bishop at f7. Find the active jump that sets the trap.',
        hint: 'Use the knight to invade the center and tempt Nxe5.',
        options: ['Nd4!', 'Nf6', 'Bc5'],
      }),
      whiteMove({
        id: 'bs-4w',
        san: 'Nxe5?',
        piece: 'knight',
        from: 'f3',
        to: 'e5',
        explanation: 'White grabs the pawn and leaves g2 and the knight vulnerable.',
        capturedSquare: 'e5',
      }),
      blackMove({
        id: 'bs-4b',
        san: 'Qg5!',
        piece: 'queen',
        from: 'd8',
        to: 'g5',
        explanation: 'Qg5 attacks g2 and the knight on e5 at the same time. The trap is sprung.',
        prompt: 'White grabs on e5. What punishing queen move creates two threats at once?',
        hint: 'Use the queen to attack g2 and the knight together.',
        options: ['Qg5!', 'Qe7', 'Nh6'],
      }),
    ],
  },
  {
    trapId: 'noahs_ark',
    moves: [
      whiteMove({ id: 'na-1w', san: 'e4', piece: 'pawn', from: 'e2', to: 'e4', explanation: 'White opens aggressively.' }),
      blackMove({
        id: 'na-1b',
        san: 'e5',
        piece: 'pawn',
        from: 'e7',
        to: 'e5',
        explanation: 'Black mirrors the center and keeps a grip on the dark squares.',
        prompt: 'White opens with e4. How does Black answer classically?',
        hint: 'Claim the center with your e-pawn.',
        options: ['e5', 'c5', 'e6'],
      }),
      whiteMove({ id: 'na-2w', san: 'Nf3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White attacks e5.' }),
      blackMove({
        id: 'na-2b',
        san: 'Nc6',
        piece: 'knight',
        from: 'b8',
        to: 'c6',
        explanation: 'Nc6 supports the pawn and invites the Ruy Lopez structure.',
        prompt: 'White attacks e5. Which developing move covers it cleanly?',
        hint: 'Bring the queenside knight to c6.',
        options: ['Nc6', 'd6', 'Nf6'],
      }),
      whiteMove({ id: 'na-3w', san: 'Bb5', piece: 'bishop', from: 'f1', to: 'b5', explanation: 'White pins the knight.' }),
      blackMove({
        id: 'na-3b',
        san: 'a6',
        piece: 'pawn',
        from: 'a7',
        to: 'a6',
        explanation: 'a6 questions the bishop and gains queenside space.',
        prompt: 'White pins on b5. Which pawn move asks the bishop a direct question?',
        hint: 'Use the a-pawn to challenge the bishop.',
        options: ['a6', 'Nf6', 'd6'],
      }),
      whiteMove({ id: 'na-4w', san: 'Ba4', piece: 'bishop', from: 'b5', to: 'a4', explanation: 'White keeps the bishop active but exposed.' }),
      blackMove({
        id: 'na-4b',
        san: 'd6',
        piece: 'pawn',
        from: 'd7',
        to: 'd6',
        explanation: 'd6 supports ...b5 and prepares to trap the bishop later.',
        prompt: 'The bishop retreats to a4. Which move supports your queenside pawn storm?',
        hint: 'Reinforce the center and prepare ...b5.',
        options: ['d6', 'b5', 'Bc5'],
      }),
      whiteMove({ id: 'na-5w', san: 'd4', piece: 'pawn', from: 'd2', to: 'd4', explanation: 'White strikes in the center.' }),
      blackMove({
        id: 'na-5b',
        san: 'b5',
        piece: 'pawn',
        from: 'b7',
        to: 'b5',
        explanation: 'b5 drives the bishop again and takes away more escape squares.',
        prompt: 'White pushes d4. Which queenside thrust keeps the bishop under pressure?',
        hint: 'Gain space with the b-pawn.',
        options: ['b5', 'exd4', 'Nf6'],
      }),
      whiteMove({ id: 'na-6w', san: 'Bb3', piece: 'bishop', from: 'a4', to: 'b3', explanation: 'White retreats again and the bishop is running out of room.' }),
      blackMove({
        id: 'na-6b',
        san: 'Nxd4',
        piece: 'knight',
        from: 'c6',
        to: 'd4',
        explanation: 'Black wins the central pawn while the bishop remains boxed in on the queenside.',
        prompt: 'The bishop lands on b3. Which tactical capture wins central material immediately?',
        hint: 'Use the c6 knight to take on d4.',
        options: ['Nxd4', 'Bb7', 'Be6'],
        capturedSquare: 'd4',
      }),
    ],
  },
  {
    trapId: 'fishing_pole',
    moves: [
      whiteMove({ id: 'fp-1w', san: 'e4', piece: 'pawn', from: 'e2', to: 'e4', explanation: 'White starts an open game.' }),
      blackMove({
        id: 'fp-1b',
        san: 'e5',
        piece: 'pawn',
        from: 'e7',
        to: 'e5',
        explanation: 'Black mirrors the center and keeps the position flexible.',
        prompt: 'White begins with e4. Which central reply keeps the Berlin setup available?',
        hint: 'Answer with your king pawn.',
        options: ['e5', 'c5', 'd5'],
      }),
      whiteMove({ id: 'fp-2w', san: 'Nf3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White attacks e5.' }),
      blackMove({
        id: 'fp-2b',
        san: 'Nc6',
        piece: 'knight',
        from: 'b8',
        to: 'c6',
        explanation: 'Nc6 develops and supports e5.',
        prompt: 'White attacks e5. Which natural developing move reinforces it?',
        hint: 'Develop the queenside knight to c6.',
        options: ['Nc6', 'Nf6', 'd6'],
      }),
      whiteMove({ id: 'fp-3w', san: 'Bb5', piece: 'bishop', from: 'f1', to: 'b5', explanation: 'White enters the Ruy Lopez.' }),
      blackMove({
        id: 'fp-3b',
        san: 'Nf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'The Berlin move order develops and invites White to castle.',
        prompt: 'White pins on b5. Which knight development enters the Berlin?',
        hint: 'Develop the king knight toward e4.',
        options: ['Nf6', 'a6', 'Bc5'],
      }),
      whiteMove({
        id: 'fp-4w',
        san: 'O-O',
        piece: 'king',
        from: 'e1',
        to: 'g1',
        explanation: 'White castles into the side where the attack will happen.',
        secondaryMove: {
          piece: 'rook',
          from: 'h1',
          to: 'f1',
        },
      }),
      blackMove({
        id: 'fp-4b',
        san: 'Ng4',
        piece: 'knight',
        from: 'f6',
        to: 'g4',
        explanation: 'Ng4 eyes h2 and invites White to weaken the kingside.',
        prompt: 'White castles short. Which jump starts the fishing pole idea?',
        hint: 'Use the knight to poke at h2 and h3.',
        options: ['Ng4', 'Be7', 'd6'],
      }),
      whiteMove({ id: 'fp-5w', san: 'h3', piece: 'pawn', from: 'h2', to: 'h3', explanation: 'White tries to kick the knight away and creates a hook.' }),
      blackMove({
        id: 'fp-5b',
        san: 'h5',
        piece: 'pawn',
        from: 'h7',
        to: 'h5',
        explanation: 'The h-pawn becomes the fishing line behind the knight bait.',
        prompt: 'White chases the knight with h3. Which pawn thrust keeps the attack alive?',
        hint: 'Advance the h-pawn one square.',
        options: ['h5', 'Nf6', 'd6'],
      }),
      whiteMove({
        id: 'fp-6w',
        san: 'hxg4?',
        piece: 'pawn',
        from: 'h3',
        to: 'g4',
        explanation: 'White accepts the bait and opens the h-file.',
        capturedSquare: 'g4',
      }),
      blackMove({
        id: 'fp-6b',
        san: 'hxg4',
        piece: 'pawn',
        from: 'h5',
        to: 'g4',
        explanation: 'Black recaptures and opens the h-file for a direct attack against the king.',
        prompt: 'White takes the knight. Which recapture opens the attack immediately?',
        hint: 'Use the h-pawn to recapture on g4.',
        options: ['hxg4', 'Qh4', 'Rh6'],
        capturedSquare: 'g4',
      }),
    ],
  },
  {
    trapId: 'stafford_gambit',
    moves: [
      whiteMove({ id: 'sg-1w', san: 'e4', piece: 'pawn', from: 'e2', to: 'e4', explanation: 'White takes central space.' }),
      blackMove({
        id: 'sg-1b',
        san: 'e5',
        piece: 'pawn',
        from: 'e7',
        to: 'e5',
        explanation: 'Black occupies the center and keeps the Petrov available.',
        prompt: 'White starts with e4. Which reply keeps the Petrov structure?',
        hint: 'Meet e4 with e5.',
        options: ['e5', 'c5', 'd5'],
      }),
      whiteMove({ id: 'sg-2w', san: 'Nf3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White attacks e5.' }),
      blackMove({
        id: 'sg-2b',
        san: 'Nf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'Black counterattacks White\'s e4 pawn and enters the Petrov.',
        prompt: 'White attacks e5. Which knight move counterattacks e4 immediately?',
        hint: 'Develop the king knight to f6.',
        options: ['Nf6', 'Nc6', 'd6'],
      }),
      whiteMove({
        id: 'sg-3w',
        san: 'Nxe5',
        piece: 'knight',
        from: 'f3',
        to: 'e5',
        explanation: 'White takes the pawn and steps into gambit territory.',
        capturedSquare: 'e5',
      }),
      blackMove({
        id: 'sg-3b',
        san: 'Nc6',
        piece: 'knight',
        from: 'b8',
        to: 'c6',
        explanation: 'Nc6 attacks the knight and invites White to help Black develop.',
        prompt: 'White grabs on e5. Which developing move begins the Stafford idea?',
        hint: 'Attack the knight with your queenside knight.',
        options: ['Nc6', 'd6', 'Qe7'],
      }),
      whiteMove({
        id: 'sg-4w',
        san: 'Nxc6',
        piece: 'knight',
        from: 'e5',
        to: 'c6',
        explanation: 'White captures on c6 and gives Black a clear d-pawn recapture.',
        capturedSquare: 'c6',
      }),
      blackMove({
        id: 'sg-4b',
        san: 'dxc6',
        piece: 'pawn',
        from: 'd7',
        to: 'c6',
        explanation: 'Black opens the d-file and bishop diagonal while recovering material.',
        prompt: 'White takes the knight on c6. Which pawn recapture keeps your initiative?',
        hint: 'The d-pawn recaptures on c6.',
        options: ['dxc6', 'bxc6', 'Qe7'],
        capturedSquare: 'c6',
      }),
      whiteMove({ id: 'sg-5w', san: 'd3', piece: 'pawn', from: 'd2', to: 'd3', explanation: 'White tries to consolidate.' }),
      blackMove({
        id: 'sg-5b',
        san: 'Bc5',
        piece: 'bishop',
        from: 'f8',
        to: 'c5',
        explanation: 'Bc5 develops with tempo and points at f2.',
        prompt: 'White slows down with d3. Which bishop move creates immediate pressure on f2?',
        hint: 'Develop the dark-squared bishop to c5.',
        options: ['Bc5', 'Be7', 'Bd6'],
      }),
      whiteMove({ id: 'sg-6w', san: 'Be2', piece: 'bishop', from: 'f1', to: 'e2', explanation: 'White blocks the queen and remains passive.' }),
      blackMove({
        id: 'sg-6b',
        san: 'h5',
        piece: 'pawn',
        from: 'h7',
        to: 'h5',
        explanation: 'The h-pawn joins the attack and sets up a direct kingside hook.',
        prompt: 'White tucks the bishop back. Which pawn move keeps the attack rolling?',
        hint: 'Use the h-pawn as an attacking hook.',
        options: ['h5', 'Qe7', 'Re8'],
      }),
      whiteMove({ id: 'sg-7w', san: 'h3', piece: 'pawn', from: 'h2', to: 'h3', explanation: 'White again creates a hook on the h-file.' }),
      blackMove({
        id: 'sg-7b',
        san: 'Ng4',
        piece: 'knight',
        from: 'f6',
        to: 'g4',
        explanation: 'Ng4 threatens the kingside and renews the bait.',
        prompt: 'White weakens with h3. Which knight jump increases the pressure?',
        hint: 'Hop to g4 and attack the light squares.',
        options: ['Ng4', 'Bd6', 'Qf6'],
      }),
      whiteMove({
        id: 'sg-8w',
        san: 'hxg4?',
        piece: 'pawn',
        from: 'h3',
        to: 'g4',
        explanation: 'White accepts the bait and opens lines to the king.',
        capturedSquare: 'g4',
      }),
      blackMove({
        id: 'sg-8b',
        san: 'hxg4',
        piece: 'pawn',
        from: 'h5',
        to: 'g4',
        explanation: 'Black opens the h-file and converts development into a direct attack.',
        prompt: 'White takes the knight. Which recapture turns the h-file into an attacking lane?',
        hint: 'Recapture with the h-pawn.',
        options: ['hxg4', 'Qh4', 'Bxf2+'],
        capturedSquare: 'g4',
      }),
    ],
  },
  {
    trapId: 'halloween_refutation',
    moves: [
      whiteMove({ id: 'hg-1w', san: 'e4', piece: 'pawn', from: 'e2', to: 'e4', explanation: 'White opens ambitiously.' }),
      blackMove({
        id: 'hg-1b',
        san: 'e5',
        piece: 'pawn',
        from: 'e7',
        to: 'e5',
        explanation: 'Black claims the center and keeps flexible development.',
        prompt: 'White opens with e4. Which reply keeps the game principled?',
        hint: 'Place your king pawn on e5.',
        options: ['e5', 'c5', 'e6'],
      }),
      whiteMove({ id: 'hg-2w', san: 'Nc3', piece: 'knight', from: 'b1', to: 'c3', explanation: 'White chooses the Vienna.' }),
      blackMove({
        id: 'hg-2b',
        san: 'Nf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'Nf6 develops and increases pressure on e4.',
        prompt: 'White develops the queenside knight. Which move attacks e4 and develops?',
        hint: 'Bring the king knight to f6.',
        options: ['Nf6', 'Nc6', 'd6'],
      }),
      whiteMove({ id: 'hg-3w', san: 'Nf3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White reinforces e5 pressure.' }),
      blackMove({
        id: 'hg-3b',
        san: 'Nc6',
        piece: 'knight',
        from: 'b8',
        to: 'c6',
        explanation: 'Black finishes development before the tactical moment.',
        prompt: 'White adds pressure on e5. Which knight development keeps everything coordinated?',
        hint: 'Use the b8 knight to support the center.',
        options: ['Nc6', 'Bb4', 'd6'],
      }),
      whiteMove({
        id: 'hg-4w',
        san: 'Nxe5?',
        piece: 'knight',
        from: 'f3',
        to: 'e5',
        explanation: 'White jumps into the center too early and loses coordination.',
        capturedSquare: 'e5',
      }),
      blackMove({
        id: 'hg-4b',
        san: 'Nxe5',
        piece: 'knight',
        from: 'c6',
        to: 'e5',
        explanation: 'Black calmly recaptures and keeps the extra space and development.',
        prompt: 'White grabs on e5. Which simple recapture refutes the idea?',
        hint: 'Use the c6 knight to take on e5.',
        options: ['Nxe5', 'd6', 'Qe7'],
        capturedSquare: 'e5',
      }),
      whiteMove({ id: 'hg-5w', san: 'd4', piece: 'pawn', from: 'd2', to: 'd4', explanation: 'White tries to chase the knight and regain initiative.' }),
      blackMove({
        id: 'hg-5b',
        san: 'Nc6',
        piece: 'knight',
        from: 'e5',
        to: 'c6',
        explanation: 'The knight calmly retreats while Black remains fully coordinated.',
        prompt: 'White pushes d4. Which retreat keeps your structure healthy and your extra tempo intact?',
        hint: 'Return the knight to c6.',
        options: ['Nc6', 'Ng6', 'Bd6'],
      }),
    ],
  },
  {
    trapId: 'lolli_trap',
    moves: [
      whiteMove({ id: 'lt-1w', san: 'e4', piece: 'pawn', from: 'e2', to: 'e4', explanation: 'White opens the center.' }),
      blackMove({
        id: 'lt-1b',
        san: 'e5',
        piece: 'pawn',
        from: 'e7',
        to: 'e5',
        explanation: 'Black meets the center directly and prepares active piece play.',
        prompt: 'White starts with e4. Which move keeps the Scotch available?',
        hint: 'Answer with e5.',
        options: ['e5', 'c5', 'e6'],
      }),
      whiteMove({ id: 'lt-2w', san: 'Nf3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White develops and attacks e5.' }),
      blackMove({
        id: 'lt-2b',
        san: 'Nc6',
        piece: 'knight',
        from: 'b8',
        to: 'c6',
        explanation: 'Nc6 supports e5 and invites d4.',
        prompt: 'White attacks the center. Which knight move reinforces e5?',
        hint: 'Develop the b8 knight to c6.',
        options: ['Nc6', 'Nf6', 'd6'],
      }),
      whiteMove({ id: 'lt-3w', san: 'd4', piece: 'pawn', from: 'd2', to: 'd4', explanation: 'White immediately challenges the center.' }),
      blackMove({
        id: 'lt-3b',
        san: 'exd4',
        piece: 'pawn',
        from: 'e5',
        to: 'd4',
        explanation: 'Black captures and opens the e-file for future tactics.',
        prompt: 'White strikes with d4. Which capture keeps the center under control?',
        hint: 'Take the pawn with e5xd4.',
        options: ['exd4', 'Nxd4', 'd6'],
        capturedSquare: 'd4',
      }),
      whiteMove({ id: 'lt-4w', san: 'Bc4', piece: 'bishop', from: 'f1', to: 'c4', explanation: 'White develops quickly and eyes f7.' }),
      blackMove({
        id: 'lt-4b',
        san: 'Nf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'Nf6 increases pressure on e4 and prepares a central counterstrike.',
        prompt: 'White develops the bishop to c4. Which move attacks e4 and improves development?',
        hint: 'Bring the king knight to f6.',
        options: ['Nf6', 'Bc5', 'Be7'],
      }),
      whiteMove({ id: 'lt-5w', san: 'e5', piece: 'pawn', from: 'e4', to: 'e5', explanation: 'White gains space but also overextends.' }),
      blackMove({
        id: 'lt-5b',
        san: 'd5!',
        piece: 'pawn',
        from: 'd7',
        to: 'd5',
        explanation: 'd5 breaks in the center before White can consolidate.',
        prompt: 'White overextends with e5. Which central break challenges everything at once?',
        hint: 'Strike back immediately with the d-pawn.',
        options: ['d5!', 'Ne4', 'Ng4'],
      }),
      whiteMove({ id: 'lt-6w', san: 'Bb5', piece: 'bishop', from: 'c4', to: 'b5', explanation: 'White tries to keep activity while the center is unstable.' }),
      blackMove({
        id: 'lt-6b',
        san: 'Ne4',
        piece: 'knight',
        from: 'f6',
        to: 'e4',
        explanation: 'The knight lands on e4 and uses the pin and central tension against White.',
        prompt: 'White retreats the bishop. Which knight jump takes over the center now?',
        hint: 'Use the f6 knight to occupy e4.',
        options: ['Ne4', 'Bd7', 'a6'],
      }),
    ],
  },
  {
    trapId: 'elephant_trap',
    moves: [
      whiteMove({ id: 'et-1w', san: 'd4', piece: 'pawn', from: 'd2', to: 'd4', explanation: 'White opens with the queen pawn.' }),
      blackMove({
        id: 'et-1b',
        san: 'd5',
        piece: 'pawn',
        from: 'd7',
        to: 'd5',
        explanation: 'Black occupies the center and heads for a classical structure.',
        prompt: 'White opens with d4. Which move claims the center symmetrically?',
        hint: 'Meet d4 with d5.',
        options: ['d5', 'Nf6', 'e6'],
      }),
      whiteMove({ id: 'et-2w', san: 'c4', piece: 'pawn', from: 'c2', to: 'c4', explanation: 'White offers the Queen\'s Gambit.' }),
      blackMove({
        id: 'et-2b',
        san: 'e6',
        piece: 'pawn',
        from: 'e7',
        to: 'e6',
        explanation: 'Black supports d5 and opens the dark-squared bishop.',
        prompt: 'White offers c4. Which move supports d5 and keeps your center healthy?',
        hint: 'Advance the e-pawn one square.',
        options: ['e6', 'dxc4', 'c6'],
      }),
      whiteMove({ id: 'et-3w', san: 'Nc3', piece: 'knight', from: 'b1', to: 'c3', explanation: 'White adds support to d5 and e4.' }),
      blackMove({
        id: 'et-3b',
        san: 'Nf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'Nf6 develops and adds pressure to e4.',
        prompt: 'White develops the queen knight. Which move improves your piece play and keeps pressure on e4?',
        hint: 'Develop the king knight to f6.',
        options: ['Nf6', 'Be7', 'c6'],
      }),
      whiteMove({ id: 'et-4w', san: 'Bg5', piece: 'bishop', from: 'c1', to: 'g5', explanation: 'White pins the knight and leans toward routine development.' }),
      blackMove({
        id: 'et-4b',
        san: 'Nbd7',
        piece: 'knight',
        from: 'b8',
        to: 'd7',
        explanation: 'The second knight supports the center and prepares the trap.',
        prompt: 'White pins on g5. Which knight move supports the center and hides the tactical idea?',
        hint: 'Develop the b8 knight to d7.',
        options: ['Nbd7', 'Be7', 'c6'],
      }),
      whiteMove({
        id: 'et-5w',
        san: 'cxd5',
        piece: 'pawn',
        from: 'c4',
        to: 'd5',
        explanation: 'White exchanges in the center and assumes the pressure is gone.',
        capturedSquare: 'd5',
      }),
      blackMove({
        id: 'et-5b',
        san: 'exd5',
        piece: 'pawn',
        from: 'e6',
        to: 'd5',
        explanation: 'Black recaptures and keeps every tactical resource alive.',
        prompt: 'White exchanges on d5. Which pawn recapture preserves your tactical setup?',
        hint: 'Use the e-pawn to recapture on d5.',
        options: ['exd5', 'Nxd5', 'c6'],
        capturedSquare: 'd5',
      }),
      whiteMove({
        id: 'et-6w',
        san: 'Nxd5?',
        piece: 'knight',
        from: 'c3',
        to: 'd5',
        explanation: 'White grabs the pawn and walks into the core of the Elephant Trap.',
        capturedSquare: 'd5',
      }),
      blackMove({
        id: 'et-6b',
        san: 'Nxd5!',
        piece: 'knight',
        from: 'f6',
        to: 'd5',
        explanation: 'Black removes the active knight and invites White to overreach with the bishop.',
        prompt: 'White grabs on d5. Which recapture keeps the trap alive?',
        hint: 'Use the f6 knight to take on d5.',
        options: ['Nxd5!', 'Be7', 'c6'],
        capturedSquare: 'd5',
      }),
      whiteMove({
        id: 'et-7w',
        san: 'Bxd8',
        piece: 'bishop',
        from: 'g5',
        to: 'd8',
        explanation: 'White thinks the queen is free and misses the counterblow.',
        capturedSquare: 'd8',
      }),
      blackMove({
        id: 'et-7b',
        san: 'Bb4+',
        piece: 'bishop',
        from: 'f8',
        to: 'b4',
        explanation: 'Bb4+ exposes the loose white queen side and wins material back with interest.',
        prompt: 'White takes your queen on d8. Which check reveals why that bishop is trapped?',
        hint: 'Use the bishop on f8 to check from b4.',
        options: ['Bb4+', 'Qe7', 'N7f6'],
      }),
    ],
  },
  {
    trapId: 'greek_gift_motif',
    moves: [
      whiteMove({ id: 'gg-1w', san: 'd4', piece: 'pawn', from: 'd2', to: 'd4', explanation: 'White begins with a solid queen pawn setup.' }),
      blackMove({
        id: 'gg-1b',
        san: 'd5',
        piece: 'pawn',
        from: 'd7',
        to: 'd5',
        explanation: 'Black matches the center and aims for healthy development.',
        prompt: 'White opens with d4. Which move matches the center and keeps your plans flexible?',
        hint: 'Answer with d5.',
        options: ['d5', 'Nf6', 'e6'],
      }),
      whiteMove({ id: 'gg-2w', san: 'Bf4', piece: 'bishop', from: 'c1', to: 'f4', explanation: 'White chooses the London setup.' }),
      blackMove({
        id: 'gg-2b',
        san: 'Nf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'Nf6 develops and points at e4.',
        prompt: 'White develops the bishop early. Which move develops and pressures e4?',
        hint: 'Bring the king knight to f6.',
        options: ['Nf6', 'c5', 'e6'],
      }),
      whiteMove({ id: 'gg-3w', san: 'e3', piece: 'pawn', from: 'e2', to: 'e3', explanation: 'White supports the center.' }),
      blackMove({
        id: 'gg-3b',
        san: 'c5',
        piece: 'pawn',
        from: 'c7',
        to: 'c5',
        explanation: 'Black immediately questions White\'s center and grabs space.',
        prompt: 'White supports the center with e3. Which pawn break challenges it right away?',
        hint: 'Use the c-pawn to strike at d4.',
        options: ['c5', 'e6', 'g6'],
      }),
      whiteMove({ id: 'gg-4w', san: 'Nf3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White continues developing.' }),
      blackMove({
        id: 'gg-4b',
        san: 'Nc6',
        piece: 'knight',
        from: 'b8',
        to: 'c6',
        explanation: 'Nc6 adds more central pressure and supports the c5 break.',
        prompt: 'White develops the king knight. Which move increases central pressure and stays flexible?',
        hint: 'Develop the queenside knight to c6.',
        options: ['Nc6', 'e6', 'Bg4'],
      }),
      whiteMove({ id: 'gg-5w', san: 'c3', piece: 'pawn', from: 'c2', to: 'c3', explanation: 'White tries to build a solid London shell.' }),
      blackMove({
        id: 'gg-5b',
        san: 'e6',
        piece: 'pawn',
        from: 'e7',
        to: 'e6',
        explanation: 'Black prepares the dark-squared bishop and keeps the center firm.',
        prompt: 'White supports d4 with c3. Which move keeps your center intact and frees the bishop?',
        hint: 'Advance the e-pawn to e6.',
        options: ['e6', 'Qb6', 'Bf5'],
      }),
      whiteMove({ id: 'gg-6w', san: 'Bd3', piece: 'bishop', from: 'f1', to: 'd3', explanation: 'White lines up the famous Greek Gift idea.' }),
      blackMove({
        id: 'gg-6b',
        san: 'Bd6',
        piece: 'bishop',
        from: 'f8',
        to: 'd6',
        explanation: 'Bd6 mirrors the bishop and helps control h2 and e5.',
        prompt: 'White aims the bishop at h7. Which developing move meets it directly?',
        hint: 'Use your dark-squared bishop on d6.',
        options: ['Bd6', 'Be7', 'Qb6'],
      }),
      whiteMove({
        id: 'gg-7w',
        san: 'O-O',
        piece: 'king',
        from: 'e1',
        to: 'g1',
        explanation: 'White castles and hopes the attack will land first.',
        secondaryMove: {
          piece: 'rook',
          from: 'h1',
          to: 'f1',
        },
      }),
      blackMove({
        id: 'gg-7b',
        san: 'O-O',
        piece: 'king',
        from: 'e8',
        to: 'g8',
        explanation: 'Black castles calmly and accepts the coming sacrifice under good conditions.',
        prompt: 'White castles. Which move keeps your king safe and invites the unsound sacrifice?',
        hint: 'Castle short.',
        options: ['O-O', 'Qe7', 'Re8'],
        secondaryMove: {
          piece: 'rook',
          from: 'h8',
          to: 'f8',
        },
      }),
      whiteMove({
        id: 'gg-8w',
        san: 'Bxh7+?',
        piece: 'bishop',
        from: 'd3',
        to: 'h7',
        explanation: 'White goes for the Greek Gift, but the attack is not justified here.',
        capturedSquare: 'h7',
      }),
      blackMove({
        id: 'gg-8b',
        san: 'Kxh7',
        piece: 'king',
        from: 'g8',
        to: 'h7',
        explanation: 'Black safely accepts the bishop and proves the sacrifice was premature.',
        prompt: 'White sacrifices on h7. How do you refute the attack immediately?',
        hint: 'Take the bishop with the king.',
        options: ['Kxh7', 'Kh8', 'Qe7'],
        capturedSquare: 'h7',
      }),
    ],
  },
  {
    trapId: 'karpov_variation_tactic',
    moves: [
      whiteMove({ id: 'kv-1w', san: 'e4', piece: 'pawn', from: 'e2', to: 'e4', explanation: 'White grabs central space.' }),
      blackMove({
        id: 'kv-1b',
        san: 'c6',
        piece: 'pawn',
        from: 'c7',
        to: 'c6',
        explanation: 'Black prepares the Caro-Kann structure.',
        prompt: 'White opens with e4. Which move signals the Caro-Kann?',
        hint: 'Advance the c-pawn to c6.',
        options: ['c6', 'e5', 'c5'],
      }),
      whiteMove({ id: 'kv-2w', san: 'd4', piece: 'pawn', from: 'd2', to: 'd4', explanation: 'White builds a broad center.' }),
      blackMove({
        id: 'kv-2b',
        san: 'd5',
        piece: 'pawn',
        from: 'd7',
        to: 'd5',
        explanation: 'Black challenges the center immediately.',
        prompt: 'White builds the center with d4. Which move challenges it directly?',
        hint: 'Strike back with d5.',
        options: ['d5', 'Nf6', 'e6'],
      }),
      whiteMove({ id: 'kv-3w', san: 'Nd2', piece: 'knight', from: 'b1', to: 'd2', explanation: 'White chooses the Karpov Variation setup.' }),
      blackMove({
        id: 'kv-3b',
        san: 'dxe4',
        piece: 'pawn',
        from: 'd5',
        to: 'e4',
        explanation: 'Black resolves the tension on favorable terms.',
        prompt: 'White develops with Nd2. Which capture keeps your structure clear and active?',
        hint: 'Take on e4 with the d-pawn.',
        options: ['dxe4', 'Nf6', 'Nd7'],
        capturedSquare: 'e4',
      }),
      whiteMove({
        id: 'kv-4w',
        san: 'Nxe4',
        piece: 'knight',
        from: 'd2',
        to: 'e4',
        explanation: 'White recaptures with the knight and centralizes it.',
        capturedSquare: 'e4',
      }),
      blackMove({
        id: 'kv-4b',
        san: 'Nd7',
        piece: 'knight',
        from: 'b8',
        to: 'd7',
        explanation: 'Nd7 reinforces f6 and prepares a tactical clamp on e5 and g4.',
        prompt: 'White centralizes on e4. Which knight move supports your counterplay and keeps the structure pure?',
        hint: 'Develop the queenside knight to d7.',
        options: ['Nd7', 'Nf6', 'Bf5'],
      }),
      whiteMove({ id: 'kv-5w', san: 'Ng5', piece: 'knight', from: 'e4', to: 'g5', explanation: 'White jumps forward and eyes f7.' }),
      blackMove({
        id: 'kv-5b',
        san: 'Ngf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'Ngf6 calmly blocks the pressure and readies tactical ideas on e4 and g4.',
        prompt: 'White jumps to g5. Which developing move blocks the threat and improves your kingside pieces?',
        hint: 'Develop the king knight to f6.',
        options: ['Ngf6', 'h6', 'e6'],
      }),
      whiteMove({ id: 'kv-6w', san: 'Bd3', piece: 'bishop', from: 'f1', to: 'd3', explanation: 'White piles on toward h7 and f5.' }),
      blackMove({
        id: 'kv-6b',
        san: 'e6',
        piece: 'pawn',
        from: 'e7',
        to: 'e6',
        explanation: 'e6 solidifies the center and opens the bishop without loosening the king.',
        prompt: 'White develops the bishop to d3. Which move keeps the center compact and frees your dark-squared bishop?',
        hint: 'Advance the e-pawn to e6.',
        options: ['e6', 'Qc7', 'h6'],
      }),
      whiteMove({ id: 'kv-7w', san: 'N1f3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White reinforces the center and keeps aiming forward.' }),
      blackMove({
        id: 'kv-7b',
        san: 'h6',
        piece: 'pawn',
        from: 'h7',
        to: 'h6',
        explanation: 'h6 questions the advanced knight and sets the trap against an overeager jump to e6.',
        prompt: 'White brings the last knight out. Which pawn move asks the advanced knight on g5 a question?',
        hint: 'Push the h-pawn one square.',
        options: ['h6', 'Be7', 'Qc7'],
      }),
      whiteMove({
        id: 'kv-8w',
        san: 'Nxe6?',
        piece: 'knight',
        from: 'g5',
        to: 'e6',
        explanation: 'White grabs a pawn and underestimates Black\'s queen pin.',
        capturedSquare: 'e6',
      }),
      blackMove({
        id: 'kv-8b',
        san: 'Qe7',
        piece: 'queen',
        from: 'd8',
        to: 'e7',
        explanation: 'Qe7 pins the knight, attacks e6, and makes White\'s forward jump look foolish.',
        prompt: 'White grabs on e6. Which queen move pins the knight and seizes the initiative?',
        hint: 'Centralize the queen on e7.',
        options: ['Qe7', 'Qa5+', 'fxe6'],
      }),
    ],
  },
  {
    trapId: 'poisoned_pawn_sequence',
    moves: [
      whiteMove({ id: 'pp-1w', san: 'e4', piece: 'pawn', from: 'e2', to: 'e4', explanation: 'White opens with a king pawn.' }),
      blackMove({
        id: 'pp-1b',
        san: 'c5',
        piece: 'pawn',
        from: 'c7',
        to: 'c5',
        explanation: 'Black chooses the Sicilian and creates immediate imbalance.',
        prompt: 'White starts with e4. Which move begins the Sicilian counterattack?',
        hint: 'Challenge the center from the side with c5.',
        options: ['c5', 'e5', 'c6'],
      }),
      whiteMove({ id: 'pp-2w', san: 'Nf3', piece: 'knight', from: 'g1', to: 'f3', explanation: 'White develops and supports d4.' }),
      blackMove({
        id: 'pp-2b',
        san: 'd6',
        piece: 'pawn',
        from: 'd7',
        to: 'd6',
        explanation: 'd6 supports c5 and prepares kingside development.',
        prompt: 'White develops the knight. Which move supports your c-pawn and frees the bishop?',
        hint: 'Advance the d-pawn one square.',
        options: ['d6', 'Nc6', 'e6'],
      }),
      whiteMove({ id: 'pp-3w', san: 'd4', piece: 'pawn', from: 'd2', to: 'd4', explanation: 'White challenges the Sicilian center.' }),
      blackMove({
        id: 'pp-3b',
        san: 'cxd4',
        piece: 'pawn',
        from: 'c5',
        to: 'd4',
        explanation: 'Black exchanges in the center to open the c-file and dark squares.',
        prompt: 'White pushes d4. Which capture keeps the Sicilian structure active?',
        hint: 'Take on d4 with the c-pawn.',
        options: ['cxd4', 'Nf6', 'e6'],
        capturedSquare: 'd4',
      }),
      whiteMove({
        id: 'pp-4w',
        san: 'Nxd4',
        piece: 'knight',
        from: 'f3',
        to: 'd4',
        explanation: 'White recaptures with the knight and centralizes it.',
        capturedSquare: 'd4',
      }),
      blackMove({
        id: 'pp-4b',
        san: 'Nf6',
        piece: 'knight',
        from: 'g8',
        to: 'f6',
        explanation: 'Nf6 attacks e4 and speeds development.',
        prompt: 'White centralizes the knight. Which move attacks e4 and develops naturally?',
        hint: 'Bring the king knight to f6.',
        options: ['Nf6', 'Nc6', 'g6'],
      }),
      whiteMove({ id: 'pp-5w', san: 'Nc3', piece: 'knight', from: 'b1', to: 'c3', explanation: 'White reinforces the center.' }),
      blackMove({
        id: 'pp-5b',
        san: 'a6',
        piece: 'pawn',
        from: 'a7',
        to: 'a6',
        explanation: 'a6 announces the Najdorf setup and prepares queen side control.',
        prompt: 'White develops the other knight. Which pawn move signals the Najdorf structure?',
        hint: 'Push the a-pawn one square.',
        options: ['a6', 'e6', 'Nc6'],
      }),
      whiteMove({ id: 'pp-6w', san: 'Bg5', piece: 'bishop', from: 'c1', to: 'g5', explanation: 'White pins the knight and prepares a sharp attack.' }),
      blackMove({
        id: 'pp-6b',
        san: 'e6',
        piece: 'pawn',
        from: 'e7',
        to: 'e6',
        explanation: 'Black solidifies the center before unleashing the queen.',
        prompt: 'White pins on g5. Which move keeps your center strong and opens lines for the queen?',
        hint: 'Advance the e-pawn to e6.',
        options: ['e6', 'Qc7', 'g6'],
      }),
      whiteMove({ id: 'pp-7w', san: 'f4', piece: 'pawn', from: 'f2', to: 'f4', explanation: 'White goes all in on an attack and neglects queen side weaknesses.' }),
      blackMove({
        id: 'pp-7b',
        san: 'Qb6',
        piece: 'queen',
        from: 'd8',
        to: 'b6',
        explanation: 'Qb6 pressures b2 and d4 and announces the poisoned pawn theme.',
        prompt: 'White pushes f4. Which queen move exposes the loose b2 pawn?',
        hint: 'Slide the queen to b6.',
        options: ['Qb6', 'Be7', 'Nc6'],
      }),
      whiteMove({ id: 'pp-8w', san: 'Qd2', piece: 'queen', from: 'd1', to: 'd2', explanation: 'White defends loosely and still thinks the pawn can be taken later.' }),
      blackMove({
        id: 'pp-8b',
        san: 'Qxb2!',
        piece: 'queen',
        from: 'b6',
        to: 'b2',
        explanation: 'Black grabs the poisoned pawn and makes White prove there is compensation before development wins out.',
        prompt: 'White plays Qd2. Which queen capture begins the poisoned pawn sequence?',
        hint: 'The loose pawn on b2 is the tactical target.',
        options: ['Qxb2!', 'Qc7', 'Be7'],
        capturedSquare: 'b2',
      }),
    ],
  },
];

export const trapTrainingById = trainingDefinitions.reduce<Record<string, TrapTrainingRecord>>(
  (records, definition) => {
    records[definition.trapId] = buildTrainingRecord(definition);
    return records;
  },
  {}
);

export const lessonStepsByTrapTrainingId = traps.reduce<Record<string, LessonStep[]>>((records, trap) => {
  const training = trapTrainingById[trap.id];
  records[trap.id] = buildLessonSteps(trap, training.tour);
  return records;
}, {});

export function getTrapTrainingById(trapId: string) {
  return trapTrainingById[trapId] ?? null;
}

export function getTrapTrainingResponse(trapId: string): TrapTrainingResponse {
  const trap = getTrapById(trapId);
  const training = getTrapTrainingById(trapId);

  if (!trap || !training) {
    throw new Error(`Training data for ${trapId} was not found.`);
  }

  return {
    trapId,
    title: trap.title,
    watch: {
      frames: training.watch,
    },
    tour: {
      supported: true,
      turns: training.tour,
    },
    practice: {
      supported: true,
      turns: training.practice,
    },
  };
}

export function validateTrainingMove(
  trapId: string,
  mode: TrainingMode,
  turnId: string,
  move: string
): MoveValidationResponse {
  const training = getTrapTrainingById(trapId);

  if (!training) {
    throw new Error(`Training data for ${trapId} was not found.`);
  }

  const turns = training[mode];
  const turnIndex = turns.findIndex((turn) => turn.id === turnId);
  const turn = turnIndex >= 0 ? turns[turnIndex] : null;

  if (!turn) {
    throw new Error(`Turn ${turnId} was not found for ${trapId}.`);
  }

  const isCorrect = normalizeMove(turn.correctMove) === normalizeMove(move);

  if (!isCorrect) {
    return {
      correct: false,
      expectedMove: turn.correctMove,
      feedback:
        mode === 'tour'
          ? 'Incorrect. Review the hint and replay the tactical idea.'
          : 'Incorrect. Try again until the response becomes automatic.',
      hint: mode === 'tour' ? turn.hint : undefined,
      isComplete: false,
    };
  }

  return {
    correct: true,
    expectedMove: turn.correctMove,
    feedback: turn.explanation,
    boardAfter: turn.boardAfter,
    isComplete: turnIndex === turns.length - 1,
  };
}