import { handler } from '../../www_page';

describe('handler', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('default', async () => {
    expect('').toBe('');
  });
});
