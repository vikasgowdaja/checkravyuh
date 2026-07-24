import { AppService } from './app.service';

describe('AppService', () => {
  it('returns a healthy shell status', () => {
    const service = new AppService();

    expect(service.getStatus()).toEqual({
      name: 'checkravyuh-api',
      status: 'ok',
      message: 'NestJS shell is running.',
      phase: 'milestone-0',
      modules: ['auth', 'catalog', 'practice', 'review', 'recommendation'],
    });
  });

  it('returns a catalog preview payload', () => {
    const service = new AppService();

    expect(service.getCatalogPreview()).toMatchObject({
      openingCount: 9,
      trapCount: 10,
      latestRelease: 'v1-preview',
    });
    expect(service.getCatalogPreview().traps).toHaveLength(3);
  });

  it('returns the opening catalog', () => {
    const service = new AppService();

    expect(service.getOpenings()).toHaveLength(9);
    expect(service.getOpenings()[0]).toMatchObject({
      id: 'italian_game',
      trapCount: 2,
    });
  });

  it('returns a detailed trap with its opening metadata', () => {
    const service = new AppService();

    expect(service.getTrap('blackburne_shilling')).toMatchObject({
      id: 'blackburne_shilling',
      title: 'Blackburne Shilling Trap',
      opening: {
        id: 'italian_game',
      },
    });
  });

  it('returns scripted watch, tour, and practice data for every trap', () => {
    const service = new AppService();

    service.getTraps().forEach((trap) => {
      const training = service.getTrapTraining(trap.id);

      expect(training.watch.frames.length).toBeGreaterThan(0);
      expect(training.tour.turns.length).toBeGreaterThan(0);
      expect(training.practice.turns.length).toBeGreaterThan(0);
    });
  });

  it('validates guided moves through the backend', () => {
    const service = new AppService();

    expect(service.validateTrapMove('blackburne_shilling', 'tour', 'turn-1', 'e5')).toMatchObject({
      correct: true,
      isComplete: false,
    });

    expect(service.validateTrapMove('blackburne_shilling', 'tour', 'turn-1', 'Nc6')).toMatchObject({
      correct: false,
      expectedMove: 'e5',
    });
  });
});