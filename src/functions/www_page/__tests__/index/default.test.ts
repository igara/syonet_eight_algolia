import { handler } from '../../index';

describe('handler', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('default', async () => {
    expect('').toBe('');
  });
});
