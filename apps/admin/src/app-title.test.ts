import { describe, expect, it } from 'vitest';

import { appTitle } from './app-title';

describe('appTitle', () => {
  it('matches the admin shell title', () => {
    expect(appTitle).toBe('Checkravyuh Admin');
  });
});