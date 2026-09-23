export type ApiStatus = {
  name: string;
  status: string;
  message: string;
  phase: string;
  modules: string[];
};

export type CatalogTrap = {
  id: string;
  title: string;
  opening: string;
  difficulty: string;
  status: string;
};

export type CatalogPreview = {
  openingCount: number;
  trapCount: number;
  latestRelease: string;
  traps: CatalogTrap[];
};

export type OpeningSummary = {
  id: string;
  name: string;
  eco: string;
  description: string;
  difficulty: string;
  trapIds: string[];
  trapCount: number;
};

export type TrapSummary = {
  id: string;
  openingId: string;
  title: string;
  summary: string;
  difficulty: string;
  estimatedMinutes: number;
  published: boolean;
  status: string;
  tacticalMotifs: string[];
  opening?: string;
};

export type TrapDetail = TrapSummary & {
  pgn: string;
  startingFen: string;
  triggerFen: string;
  winningContinuation: string[];
  commonMistakes: string[];
  ratingRange: {
    min: number;
    max: number;
  };
  engineEvaluation: string;
  references: string[];
  overview: string;
  idea: string;
  whenItWorks: string;
  warning: string;
  opening: {
    id: string;
    name: string;
    eco: string;
    description: string;
    difficulty: string;
    trapIds: string[];
  };
};

export type LessonResponse = {
  trapId: string;
  title: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    content: string;
    fen?: string;
    hint?: string;
  }>;
  modes?: {
    watchMoves: number;
    tourTurns: number;
    practiceTurns: number;
  };
};

export type BoardPiece = {
  id: string;
  kind: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
  square: string;
};

export type BoardFrame = {
  id: string;
  label: string;
  prompt: string;
  movePlayed?: string;
  narration: string;
  highlightSquares?: string[];
  pieces: BoardPiece[];
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
  boardBefore: BoardFrame;
  boardAfter: BoardFrame;
};

export type TrapTrainingResponse = {
  trapId: string;
  title: string;
  watch: {
    frames: BoardFrame[];
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

export type PracticeResponse = {
  trapId: string;
  title: string;
  mode: string;
  supported: boolean;
  frames: BoardFrame[];
  turns: GuidedTurn[];
};

export type MoveValidationResponse = {
  correct: boolean;
  expectedMove: string;
  feedback: string;
  hint?: string;
  boardAfter?: BoardFrame;
  isComplete: boolean;
};

export type ReviewResponse = {
  dueToday: number;
  streak: number;
  queue: Array<{
    trapId: string;
    title: string;
    mastery: number;
    nextReview: string;
  }>;
};

const defaultApiBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3200' : '/api';

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
export const featuredTrapId = 'blackburne_shilling';

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}.`);
  }

  return (await response.json()) as T;
}