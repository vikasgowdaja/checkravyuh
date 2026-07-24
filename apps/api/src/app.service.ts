import { Injectable, NotFoundException } from '@nestjs/common';

import {
  getOpeningById,
  getTrapById,
  openings,
  traps,
} from './training-catalog';
import {
  getTrapTrainingById,
  getTrapTrainingResponse,
  lessonStepsByTrapTrainingId,
  validateTrainingMove,
} from './training-modes';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'checkravyuh-api',
      status: 'ok',
      message: 'NestJS shell is running.',
      phase: 'milestone-0',
      modules: ['auth', 'catalog', 'practice', 'review', 'recommendation'],
    };
  }

  getCatalogPreview() {
    return {
      openingCount: openings.length,
      trapCount: traps.length,
      latestRelease: 'v1-preview',
      traps: traps.slice(0, 3).map((trap) => ({
        id: trap.id,
        title: trap.title,
        opening: getOpeningById(trap.openingId)?.name ?? 'Unknown opening',
        difficulty: trap.difficulty,
        status: trap.status,
      })),
    };
  }

  getOpenings() {
    return openings.map((opening) => ({
      ...opening,
      trapCount: opening.trapIds.length,
    }));
  }

  getOpening(openingId: string) {
    const opening = getOpeningById(openingId);

    if (!opening) {
      throw new NotFoundException(`Opening ${openingId} was not found.`);
    }

    return {
      ...opening,
      traps: traps.filter((trap) => trap.openingId === openingId),
    };
  }

  getTraps() {
    return traps.map((trap) => ({
      ...trap,
      opening: getOpeningById(trap.openingId)?.name ?? 'Unknown opening',
    }));
  }

  getTrap(trapId: string) {
    const trap = getTrapById(trapId);

    if (!trap) {
      throw new NotFoundException(`Trap ${trapId} was not found.`);
    }

    return {
      ...trap,
      opening: getOpeningById(trap.openingId),
    };
  }

  getTrapLesson(trapId: string) {
    const trap = this.getTrap(trapId);
    const training = getTrapTrainingById(trapId);

    return {
      trapId,
      title: `${trap.title} Tour`,
      steps:
        lessonStepsByTrapTrainingId[trapId] ?? [
          {
            stepNumber: 1,
            title: 'Overview',
            content: trap.summary,
          },
          {
            stepNumber: 2,
            title: 'Core Idea',
            content: trap.idea,
          },
          {
            stepNumber: 3,
            title: 'Warning',
            content: trap.warning,
          },
        ],
      modes: {
        watchMoves: training?.watch.length ?? 0,
        tourTurns: training?.tour.length ?? 0,
        practiceTurns: training?.practice.length ?? 0,
      },
    };
  }

  getTrapTraining(trapId: string) {
    this.getTrap(trapId);

    return getTrapTrainingResponse(trapId);
  }

  getTrapWatch(trapId: string) {
    const training = this.getTrapTraining(trapId);

    return {
      trapId,
      title: `${training.title} Watch`,
      mode: 'watch',
      frames: training.watch.frames,
    };
  }

  getTrapTour(trapId: string) {
    const training = this.getTrapTraining(trapId);

    return {
      trapId,
      title: `${training.title} Tour`,
      mode: 'tour',
      supported: true,
      turns: training.tour.turns,
    };
  }

  getTrapPractice(trapId: string) {
    const training = this.getTrapTraining(trapId);

    return {
      trapId,
      title: `${training.title} Practice`,
      mode: 'practice',
      frames: training.watch.frames,
      turns: training.practice.turns,
      supported: true,
    };
  }

  validateTrapMove(trapId: string, mode: 'tour' | 'practice', turnId: string, move: string) {
    this.getTrap(trapId);

    try {
      return validateTrainingMove(trapId, mode, turnId, move);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Move validation failed.';
      throw new NotFoundException(message);
    };
  }

  getTodayReview() {
    return {
      dueToday: 3,
      streak: 4,
      queue: [
        {
          trapId: 'blackburne_shilling',
          title: 'Blackburne Shilling Trap',
          mastery: 42,
          nextReview: 'today',
        },
        {
          trapId: 'elephant_trap',
          title: 'Elephant Trap',
          mastery: 27,
          nextReview: 'today',
        },
        {
          trapId: 'poisoned_pawn_sequence',
          title: 'Poisoned Pawn Tactical Sequence',
          mastery: 18,
          nextReview: 'today',
        },
      ],
    };
  }
}