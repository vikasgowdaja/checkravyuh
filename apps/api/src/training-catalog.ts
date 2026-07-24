export type OpeningRecord = {
  id: string;
  name: string;
  eco: string;
  description: string;
  difficulty: string;
  trapIds: string[];
};

export type TrapRecord = {
  id: string;
  openingId: string;
  title: string;
  summary: string;
  difficulty: string;
  estimatedMinutes: number;
  published: boolean;
  status: string;
  pgn: string;
  startingFen: string;
  triggerFen: string;
  winningContinuation: string[];
  commonMistakes: string[];
  tacticalMotifs: string[];
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
};

export type LessonStep = {
  stepNumber: number;
  title: string;
  content: string;
  fen?: string;
  hint?: string;
};

export type PieceRecord = {
  id: string;
  kind: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
  square: string;
};

export type PracticeFrame = {
  id: string;
  label: string;
  prompt: string;
  movePlayed?: string;
  narration: string;
  highlightSquares?: string[];
  pieces: PieceRecord[];
};

export const openings: OpeningRecord[] = [
  {
    id: 'italian_game',
    name: 'Italian Game',
    eco: 'C50',
    description: 'An open game where Black can punish overeager attacks and sloppy piece placement.',
    difficulty: 'intermediate',
    trapIds: ['blackburne_shilling', 'noahs_ark'],
  },
  {
    id: 'berlin_defense',
    name: 'Berlin Defense',
    eco: 'C65',
    description: 'Solid central development with tactical counterplay when White overextends.',
    difficulty: 'intermediate',
    trapIds: ['fishing_pole'],
  },
  {
    id: 'petrov_defense',
    name: 'Petrov Defense',
    eco: 'C42',
    description: 'A practical defense where tactical ambushes punish casual development.',
    difficulty: 'advanced',
    trapIds: ['stafford_gambit'],
  },
  {
    id: 'vienna_game',
    name: 'Vienna Game',
    eco: 'C27',
    description: 'Sharp early positions where Black can refute optimistic gambit play.',
    difficulty: 'intermediate',
    trapIds: ['halloween_refutation'],
  },
  {
    id: 'scotch_game',
    name: 'Scotch Game',
    eco: 'C45',
    description: 'Open central battles where precise move order wins material quickly.',
    difficulty: 'intermediate',
    trapIds: ['lolli_trap'],
  },
  {
    id: 'queens_gambit',
    name: 'Queen\'s Gambit',
    eco: 'D30',
    description: 'Classical queen pawn structures with tactical punishments for greedy captures.',
    difficulty: 'intermediate',
    trapIds: ['elephant_trap'],
  },
  {
    id: 'london_system',
    name: 'London System',
    eco: 'D02',
    description: 'Reliable setups where Black needs to recognize attacking motifs and timely counterplay.',
    difficulty: 'intermediate',
    trapIds: ['greek_gift_motif'],
  },
  {
    id: 'caro_kann',
    name: 'Caro-Kann',
    eco: 'B17',
    description: 'Durable pawn structures with tactical resources against routine white plans.',
    difficulty: 'intermediate',
    trapIds: ['karpov_variation_tactic'],
  },
  {
    id: 'sicilian_defense',
    name: 'Sicilian Defense',
    eco: 'B90',
    description: 'Counterattacking positions where poisoned pawns and loose kings create tactical shots.',
    difficulty: 'advanced',
    trapIds: ['poisoned_pawn_sequence'],
  },
];

export const traps: TrapRecord[] = [
  {
    id: 'blackburne_shilling',
    openingId: 'italian_game',
    title: 'Blackburne Shilling Trap',
    summary: 'Punish White for grabbing central material without respecting Black\'s queen jump to g5.',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    published: true,
    status: 'featured-demo',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5',
    startingFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4',
    triggerFen: 'r1bqkbnr/pppp1ppp/2n5/4N3/2BnP3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4',
    winningContinuation: ['Qg5', 'Qxg2', 'Qxe4+'],
    commonMistakes: ['Taking on e5 too early', 'Ignoring Black\'s queen activity', 'Underestimating the knight on d4'],
    tacticalMotifs: ['double attack', 'queen invasion', 'loose piece punishment'],
    ratingRange: { min: 700, max: 1800 },
    engineEvaluation: '-1.4 after 4...Qg5',
    references: ['Practical miniatures in open games', 'Italian Game trap collections'],
    overview: 'Black allows White to feel comfortable before striking at the loose knight and king side.',
    idea: 'The knight jump to d4 invites a greedy capture so the queen can enter with tempo.',
    whenItWorks: 'When White develops the bishop to c4 and grabs e5 before securing the king side.',
    warning: 'If White plays carefully and castles early, Black must switch to normal development.',
  },
  {
    id: 'noahs_ark',
    openingId: 'italian_game',
    title: 'Noah\'s Ark Trap',
    summary: 'Trap White\'s bishop on the queenside with a timely pawn march.',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 d6 5. d4 b5 6. Bb3 Nxd4',
    startingFen: 'r1bqkbnr/1pp2ppp/p1np4/1B2p3/3PP3/5N2/PPP2PPP/RNBQK2R b KQkq - 0 5',
    triggerFen: 'r1bqkbnr/2p2ppp/p1np4/1p2p3/3PP3/1B3N2/PPP2PPP/RNBQK2R w KQkq - 0 6',
    winningContinuation: ['Nxd4', 'c5'],
    commonMistakes: ['Retreating the bishop too late'],
    tacticalMotifs: ['trapping piece'],
    ratingRange: { min: 800, max: 1900 },
    engineEvaluation: '-0.9 after the trap sequence',
    references: ['Ruy Lopez tactical motifs'],
    overview: 'Black pushes pawns to take away the bishop\'s escape squares.',
    idea: 'Space on the queenside becomes a tactical net.',
    whenItWorks: 'When White leaves the bishop exposed on the b-file diagonal.',
    warning: 'Do not overpush if White can strike the center immediately.',
  },
  {
    id: 'fishing_pole',
    openingId: 'berlin_defense',
    title: 'Fishing Pole Trap',
    summary: 'Lure White into grabbing a knight so the h-file attack crashes through.',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Ng4 5. h3 h5',
    startingFen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P1n1/5N1P/PPPP1PP1/RNBQ1RK1 b kq - 0 5',
    triggerFen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p2p/4P1n1/5N1P/PPPP1PP1/RNBQ1RK1 w kq - 0 6',
    winningContinuation: ['hxg4', 'Qh4'],
    commonMistakes: ['Accepting the knight without calculating the h-file attack'],
    tacticalMotifs: ['decoy', 'mating net'],
    ratingRange: { min: 1000, max: 2000 },
    engineEvaluation: 'Dynamic compensation',
    references: ['Fishing Pole practical guides'],
    overview: 'Black uses the knight as bait for an attacking pawn storm.',
    idea: 'Open the h-file with tempo against White\'s castled king.',
    whenItWorks: 'When White has committed to short castling and weakened h3.',
    warning: 'If White declines the bait, Black must regroup quickly.',
  },
  {
    id: 'stafford_gambit',
    openingId: 'petrov_defense',
    title: 'Stafford Gambit Trap',
    summary: 'Use rapid development and tactical threats to punish careless white setup.',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nc6',
    startingFen: 'r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 1 4',
    triggerFen: 'r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 1 4',
    winningContinuation: ['Qe7', 'Nxe4'],
    commonMistakes: ['Developing passively and missing Black\'s threats'],
    tacticalMotifs: ['development lead', 'fork'],
    ratingRange: { min: 900, max: 2000 },
    engineEvaluation: 'Objectively risky but practical',
    references: ['Modern online rapid practice'],
    overview: 'Black sacrifices a pawn for initiative and tactical traps.',
    idea: 'Tempo-rich development is worth more than material for a short window.',
    whenItWorks: 'When White drifts instead of returning material or consolidating.',
    warning: 'Use this as a training motif, not as an always-correct opening strategy.',
  },
  {
    id: 'halloween_refutation',
    openingId: 'vienna_game',
    title: 'Halloween Gambit Refutation',
    summary: 'Neutralize the knight sacrifice and punish White\'s overextension cleanly.',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. e4 e5 2. Nc3 Nf6 3. Nf3 Nc6 4. Nxe5 Nxe5',
    startingFen: 'r1bqkb1r/pppp1ppp/2n2n2/4n3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
    triggerFen: 'r1bqkb1r/pppp1ppp/2n2n2/4n3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
    winningContinuation: ['Nxe5', 'd5'],
    commonMistakes: ['Giving back the pawn unnecessarily'],
    tacticalMotifs: ['central break'],
    ratingRange: { min: 700, max: 1800 },
    engineEvaluation: '-1.0 with accurate defense',
    references: ['Vienna tactical primers'],
    overview: 'Black accepts the challenge calmly and centralizes.',
    idea: 'The best refutation is often simple development with tempo.',
    whenItWorks: 'When White sacrifices before finishing development.',
    warning: 'Do not chase ghosts on the wings.',
  },
  {
    id: 'lolli_trap',
    openingId: 'scotch_game',
    title: 'Lolli Trap',
    summary: 'Exploit tactical overloads around the pinned center and undeveloped king side.',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4',
    startingFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2BpP3/5N2/PPP2PPP/RNBQK2R b KQkq - 1 4',
    triggerFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2BpP3/5N2/PPP2PPP/RNBQK2R b KQkq - 1 4',
    winningContinuation: ['Nf6', 'Nxe4'],
    commonMistakes: ['Ignoring the central pin and tactical shots'],
    tacticalMotifs: ['overload', 'pin'],
    ratingRange: { min: 800, max: 1800 },
    engineEvaluation: 'Equal with practical chances',
    references: ['Scotch tactical ideas'],
    overview: 'One careless developing move can hand Black the initiative.',
    idea: 'Black needs to recognize when a center capture becomes a tactical resource.',
    whenItWorks: 'When White overvalues activity over king safety.',
    warning: 'Do not let White seize the center for free.',
  },
  {
    id: 'elephant_trap',
    openingId: 'queens_gambit',
    title: 'Elephant Trap',
    summary: 'Punish the greedy queen with a discovered attack and tactical fork.',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Nbd7',
    startingFen: 'r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 5 5',
    triggerFen: 'r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 5 5',
    winningContinuation: ['Bb4', 'Ne4'],
    commonMistakes: ['Grabbing the queen side pawn without checking the center'],
    tacticalMotifs: ['discovered attack', 'fork'],
    ratingRange: { min: 800, max: 1700 },
    engineEvaluation: 'Tactical equality with best play',
    references: ['Queen\'s Gambit trap surveys'],
    overview: 'Black uses piece coordination to turn a harmless position tactical.',
    idea: 'The queen is often the real target, even when another piece appears attacked.',
    whenItWorks: 'When White chases material and leaves the center loose.',
    warning: 'Black must coordinate the bishop and knight precisely.',
  },
  {
    id: 'greek_gift_motif',
    openingId: 'london_system',
    title: 'Greek Gift-style Tactical Motif',
    summary: 'Recognize when White\'s kingside structure allows a forcing sacrifice or counter tactic.',
    difficulty: 'advanced',
    estimatedMinutes: 7,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. d4 d5 2. Bf4 Nf6 3. e3 c5',
    startingFen: 'rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4',
    triggerFen: 'rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4',
    winningContinuation: ['Bxh2+', 'Ng4'],
    commonMistakes: ['Launching the attack before enough pieces join'],
    tacticalMotifs: ['sacrifice', 'mating net'],
    ratingRange: { min: 1100, max: 2100 },
    engineEvaluation: 'Position-dependent',
    references: ['Classical bishop sacrifice motifs'],
    overview: 'This lesson teaches recognition more than memorization.',
    idea: 'Coordinate bishop, queen, and knight against the castled king.',
    whenItWorks: 'When White\'s kingside defenders are overloaded or misplaced.',
    warning: 'Do not sacrifice without enough attackers.',
  },
  {
    id: 'karpov_variation_tactic',
    openingId: 'caro_kann',
    title: 'Karpov Variation Tactical Trap',
    summary: 'Use the central tension to punish automatic recaptures and careless queen development.',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. e4 c6 2. d4 d5 3. Nd2 dxe4 4. Nxe4 Nd7',
    startingFen: 'r1bqkbnr/pp1npppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 2 5',
    triggerFen: 'r1bqkbnr/pp1npppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 2 5',
    winningContinuation: ['Ngf6', 'Bf5'],
    commonMistakes: ['Allowing White to consolidate a broad center without challenge'],
    tacticalMotifs: ['central break', 'pin'],
    ratingRange: { min: 900, max: 1800 },
    engineEvaluation: 'Solid equality with tactical chances',
    references: ['Caro-Kann tactical lessons'],
    overview: 'Black stays sound but ready to punish loose development.',
    idea: 'The tactical shot appears only after disciplined setup.',
    whenItWorks: 'When White overextends for space and forgets king safety.',
    warning: 'Patience matters more than immediate fireworks.',
  },
  {
    id: 'poisoned_pawn_sequence',
    openingId: 'sicilian_defense',
    title: 'Poisoned Pawn Tactical Sequence',
    summary: 'Teach why a pawn grab can lose to development and king exposure.',
    difficulty: 'advanced',
    estimatedMinutes: 9,
    published: true,
    status: 'curriculum-planned',
    pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6',
    startingFen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    triggerFen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    winningContinuation: ['Qb6', 'Qxb2'],
    commonMistakes: ['Snatching pawns without development'],
    tacticalMotifs: ['poisoned pawn', 'initiative'],
    ratingRange: { min: 1200, max: 2200 },
    engineEvaluation: 'Sharp dynamic play',
    references: ['Najdorf tactical models'],
    overview: 'This lesson simplifies a famous tactical theme for practical learning.',
    idea: 'Material is less important than king safety and lead in development.',
    whenItWorks: 'When the side grabbing material neglects the center and king.',
    warning: 'Only enter these lines if you understand the resulting initiative.',
  },
];

export const lessonStepsByTrapId: Record<string, LessonStep[]> = {
  blackburne_shilling: [
    {
      stepNumber: 1,
      title: 'Overview',
      content: 'Black invites White to overreach in the Italian before striking with queen activity.',
    },
    {
      stepNumber: 2,
      title: 'Goal',
      content: 'Recognize when Nxe5 is greedy and prepare the queen jump to g5.',
      hint: 'Look at White\'s loose knight and king-side pawns.',
    },
    {
      stepNumber: 3,
      title: 'Recognize Pattern',
      content: 'White has bishop on c4, knight on f3, and has not defended the g2 pawn fully.',
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4',
    },
    {
      stepNumber: 4,
      title: 'Execute Trap',
      content: 'Jump with ...Nd4 and if White grabs e5, reply with ...Qg5.',
      hint: 'The queen move attacks g2 and e5 at the same time.',
    },
    {
      stepNumber: 5,
      title: 'Why It Works',
      content: 'White\'s king side is undeveloped, the knight on e5 becomes unstable, and g2 is weak.',
    },
    {
      stepNumber: 6,
      title: 'Common Mistakes',
      content: 'Playing a routine developing move instead of using the tactical window immediately.',
    },
    {
      stepNumber: 7,
      title: 'Quiz',
      content: 'When White takes e5 after ...Nd4, what forcing move creates double threats?',
      hint: 'Queen to g5.',
    },
    {
      stepNumber: 8,
      title: 'Review',
      content: 'Remember the pattern: bishop on c4, greedy knight capture, queen invasion.',
    },
  ],
};

const blackburnePracticeFrames: PracticeFrame[] = [
  {
    id: 'frame-1',
    label: 'Step 1',
    prompt: 'White opens with e4. Answer in the center.',
    movePlayed: '1. e4',
    narration: 'White claims the center. Black mirrors and prepares open-game tactics.',
    highlightSquares: ['e4', 'e5'],
    pieces: [
      { id: 'wk', kind: 'king', color: 'white', square: 'e1' },
      { id: 'wq', kind: 'queen', color: 'white', square: 'd1' },
      { id: 'wb1', kind: 'bishop', color: 'white', square: 'c4' },
      { id: 'wn1', kind: 'knight', color: 'white', square: 'f3' },
      { id: 'wn2', kind: 'knight', color: 'white', square: 'g1' },
      { id: 'wp1', kind: 'pawn', color: 'white', square: 'e4' },
      { id: 'wp2', kind: 'pawn', color: 'white', square: 'g2' },
      { id: 'bk', kind: 'king', color: 'black', square: 'e8' },
      { id: 'bq', kind: 'queen', color: 'black', square: 'd8' },
      { id: 'bb1', kind: 'bishop', color: 'black', square: 'f8' },
      { id: 'bn1', kind: 'knight', color: 'black', square: 'c6' },
      { id: 'bp1', kind: 'pawn', color: 'black', square: 'e7' },
      { id: 'bp2', kind: 'pawn', color: 'black', square: 'g7' },
    ],
  },
  {
    id: 'frame-2',
    label: 'Step 2',
    prompt: 'Black replies with ...e5.',
    movePlayed: '1... e5',
    narration: 'The e-pawn advances and opens lines for the queen and bishop.',
    highlightSquares: ['e7', 'e5'],
    pieces: [
      { id: 'wk', kind: 'king', color: 'white', square: 'e1' },
      { id: 'wq', kind: 'queen', color: 'white', square: 'd1' },
      { id: 'wb1', kind: 'bishop', color: 'white', square: 'c4' },
      { id: 'wn1', kind: 'knight', color: 'white', square: 'f3' },
      { id: 'wn2', kind: 'knight', color: 'white', square: 'g1' },
      { id: 'wp1', kind: 'pawn', color: 'white', square: 'e4' },
      { id: 'wp2', kind: 'pawn', color: 'white', square: 'g2' },
      { id: 'bk', kind: 'king', color: 'black', square: 'e8' },
      { id: 'bq', kind: 'queen', color: 'black', square: 'd8' },
      { id: 'bb1', kind: 'bishop', color: 'black', square: 'f8' },
      { id: 'bn1', kind: 'knight', color: 'black', square: 'c6' },
      { id: 'bp1', kind: 'pawn', color: 'black', square: 'e5' },
      { id: 'bp2', kind: 'pawn', color: 'black', square: 'g7' },
    ],
  },
  {
    id: 'frame-3',
    label: 'Step 3',
    prompt: 'White grabs e5. This is the trap trigger.',
    movePlayed: '4. Nxe5?',
    narration: 'White takes the pawn and leaves g2 and the knight vulnerable.',
    highlightSquares: ['f3', 'e5'],
    pieces: [
      { id: 'wk', kind: 'king', color: 'white', square: 'e1' },
      { id: 'wq', kind: 'queen', color: 'white', square: 'd1' },
      { id: 'wb1', kind: 'bishop', color: 'white', square: 'c4' },
      { id: 'wn1', kind: 'knight', color: 'white', square: 'e5' },
      { id: 'wn2', kind: 'knight', color: 'white', square: 'g1' },
      { id: 'wp1', kind: 'pawn', color: 'white', square: 'e4' },
      { id: 'wp2', kind: 'pawn', color: 'white', square: 'g2' },
      { id: 'bk', kind: 'king', color: 'black', square: 'e8' },
      { id: 'bq', kind: 'queen', color: 'black', square: 'd8' },
      { id: 'bb1', kind: 'bishop', color: 'black', square: 'f8' },
      { id: 'bn1', kind: 'knight', color: 'black', square: 'd4' },
      { id: 'bp2', kind: 'pawn', color: 'black', square: 'g7' },
    ],
  },
  {
    id: 'frame-4',
    label: 'Step 4',
    prompt: 'Find the punishing move for Black.',
    movePlayed: '4... Qg5!',
    narration: 'The queen attacks g2 and e5 at once. White cannot defend everything.',
    highlightSquares: ['d8', 'g5', 'g2'],
    pieces: [
      { id: 'wk', kind: 'king', color: 'white', square: 'e1' },
      { id: 'wq', kind: 'queen', color: 'white', square: 'd1' },
      { id: 'wb1', kind: 'bishop', color: 'white', square: 'c4' },
      { id: 'wn1', kind: 'knight', color: 'white', square: 'e5' },
      { id: 'wn2', kind: 'knight', color: 'white', square: 'g1' },
      { id: 'wp1', kind: 'pawn', color: 'white', square: 'e4' },
      { id: 'wp2', kind: 'pawn', color: 'white', square: 'g2' },
      { id: 'bk', kind: 'king', color: 'black', square: 'e8' },
      { id: 'bq', kind: 'queen', color: 'black', square: 'g5' },
      { id: 'bb1', kind: 'bishop', color: 'black', square: 'f8' },
      { id: 'bn1', kind: 'knight', color: 'black', square: 'd4' },
      { id: 'bp2', kind: 'pawn', color: 'black', square: 'g7' },
    ],
  },
];

export const practiceByTrapId: Record<string, { trapId: string; mode: string; frames: PracticeFrame[] }> = {
  blackburne_shilling: {
    trapId: 'blackburne_shilling',
    mode: 'guided',
    frames: blackburnePracticeFrames,
  },
};

export function getOpeningById(openingId: string) {
  return openings.find((opening) => opening.id === openingId) ?? null;
}

export function getTrapById(trapId: string) {
  return traps.find((trap) => trap.id === trapId) ?? null;
}