import type { OpeningSummary } from './api';

type CurriculumTrapIdeaTemplate = {
  id: string;
  title: string;
  line: string;
  summary: string;
  themes: string[];
  status: 'live' | 'planned';
  trapId?: string;
};

type CurriculumFamilyTemplate = {
  id: string;
  title: string;
  moves: string;
  description: string;
  openingIds: string[];
  trapIdeas?: CurriculumTrapIdeaTemplate[];
};

type CurriculumSectionTemplate = {
  id: 'against-white' | 'against-black';
  title: string;
  description: string;
  status: 'live' | 'planned';
  families: CurriculumFamilyTemplate[];
};

export type CurriculumFamily = CurriculumFamilyTemplate & {
  openings: OpeningSummary[];
  trapCount: number;
  isLive: boolean;
  trapIdeas: CurriculumTrapIdeaTemplate[];
};

export type CurriculumSection = Omit<CurriculumSectionTemplate, 'families'> & {
  families: CurriculumFamily[];
  liveTrapCount: number;
};

const curriculumTemplates: CurriculumSectionTemplate[] = [
  {
    id: 'against-white',
    title: 'Against White',
    description: 'Live black-side trap lessons grouped by White opening family and move order.',
    status: 'live',
    families: [
      {
        id: 'open-games',
        title: 'Open Games',
        moves: '1.e4 e5',
        description: 'Classical king-pawn positions where Black punishes fast development errors.',
        openingIds: ['italian_game', 'berlin_defense', 'petrov_defense', 'vienna_game', 'scotch_game'],
      },
      {
        id: 'queen-pawn-games',
        title: 'Queen Pawn Games',
        moves: '1.d4 d5',
        description: 'Structured central play where Black punishes greedy captures, loose pins, and careless bishop development.',
        openingIds: ['queens_gambit', 'london_system'],
        trapIdeas: [
          {
            id: 'queens-gambit-central-break',
            title: 'Queen\'s Gambit Central Break Trap',
            line: '1.d4 d5 2.c4 e6 ... 12...e5!',
            summary: 'If White grabs material too casually, Black opens the center and seizes the initiative with tactical pressure.',
            themes: ['central break', 'development advantage'],
            status: 'planned',
          },
          {
            id: 'elephant-trap',
            title: 'Elephant Trap',
            line: '1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7',
            summary: 'After White drifts with the wrong queen-side or knight move, Black uses ...Bb4 and ...Ne4 to win material.',
            themes: ['pin', 'overloaded knight'],
            status: 'live',
            trapId: 'elephant_trap',
          },
          {
            id: 'noahs-ark-queens-pawn',
            title: 'Noah\'s Ark Trap',
            line: '1.d4 d5 2.c4 e6 3.Nc3 Bb4 4.a3 Bxc3+ 5.bxc3',
            summary: 'If White leaves the bishop loose later, Black can trap it with ...h6 and ...g5.',
            themes: ['bishop trapped by pawns'],
            status: 'planned',
          },
          {
            id: 'marshall-trap',
            title: 'Marshall Trap',
            line: '1.d4 d5 2.c4 Nf6 3.Nc3 e6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6',
            summary: 'A greedy capture by White lets Black answer with ...Nxd5 and strong discovered-attack play.',
            themes: ['discovered attack', 'initiative'],
            status: 'planned',
          },
          {
            id: 'cambridge-springs-trap',
            title: 'Cambridge Springs Trap',
            line: '1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.Nf3 c6 6.e3 Qa5',
            summary: 'After 7.Nd2?, Black gains multiple tactical threats with ...Bb4 against the pinned knight and queen side.',
            themes: ['pin', 'queen pressure'],
            status: 'planned',
          },
        ],
      },
      {
        id: 'queen-pawn-countergambits',
        title: 'Countergambits vs 1.d4',
        moves: '1.d4 e5 / 1.d4 d5 2.c4 e5',
        description: 'Sharp queen-pawn countergambits where Black trades material or structure for rapid development and direct attacks.',
        openingIds: [],
        trapIdeas: [
          {
            id: 'albin-lasker-trap',
            title: 'Albin Countergambit - Lasker Trap',
            line: '1.d4 d5 2.c4 e5 3.dxe5 d4',
            summary: 'If White develops carelessly, Black builds rapid piece activity and attacking momentum after ...Qe7 and ...O-O-O.',
            themes: ['sacrifice', 'rapid development'],
            status: 'planned',
          },
          {
            id: 'englund-gambit-trap',
            title: 'Englund Gambit Trap',
            line: '1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7',
            summary: 'White often misplaces the bishop with 4.Bf4?? and runs into ...Qb4+ with immediate tactical threats.',
            themes: ['queen check', 'tactical punishment'],
            status: 'planned',
          },
        ],
      },
      {
        id: 'caro-kann-structures',
        title: 'Caro-Kann Structures',
        moves: '1.e4 c6 2.d4 d5',
        description: 'Durable center play with tactical punishments against routine White plans.',
        openingIds: ['caro_kann'],
      },
      {
        id: 'sicilian-counterplay',
        title: 'Sicilian Counterplay',
        moves: '1.e4 c5',
        description: 'Counterattacking positions with poisoned pawns and king-side tactical shots.',
        openingIds: ['sicilian_defense'],
      },
    ],
  },
  {
    id: 'against-black',
    title: 'Against Black',
    description: 'Planned white-side curriculum grouped by the Black defenses you want to face.',
    status: 'planned',
    families: [
      {
        id: 'white-open-games',
        title: 'Open Games as White',
        moves: '1.e4 e5',
        description: 'White-side tactical traps against Black replies in open games.',
        openingIds: [],
      },
      {
        id: 'white-queen-pawn-games',
        title: 'Queen Pawn Games as White',
        moves: '1.d4 d5',
        description: 'White-side lines against classical Black setups in queen-pawn structures.',
        openingIds: [],
      },
    ],
  },
];

export function buildCurriculumSections(openings: OpeningSummary[]): CurriculumSection[] {
  const openingById = new Map(openings.map((opening) => [opening.id, opening] as const));

  return curriculumTemplates.map((section) => {
    const families = section.families.map((family) => {
      const familyOpenings = family.openingIds
        .map((openingId) => openingById.get(openingId))
        .filter((opening): opening is OpeningSummary => Boolean(opening));
      const trapCount = familyOpenings.reduce((sum, opening) => sum + opening.trapCount, 0);

      return {
        ...family,
        openings: familyOpenings,
        trapCount,
        isLive: familyOpenings.length > 0,
        trapIdeas: family.trapIdeas ?? [],
      };
    });

    return {
      ...section,
      families,
      liveTrapCount: families.reduce((sum, family) => sum + family.trapCount, 0),
    };
  });
}