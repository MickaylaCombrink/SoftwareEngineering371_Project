// Unit test: Express is faked with plain objects, so only the wrapper is exercised.
const catchAsync = require('../src/utils/catchAsync');

describe('catchAsync', () => {
  const req = {};
  const res = {};

  test('passes a rejection to next() instead of leaving it unhandled', async () => {
    const boom = new Error('database unreachable');
    const next = jest.fn();

    await catchAsync(async () => {
      throw boom;
    })(req, res, next);

    expect(next).toHaveBeenCalledWith(boom);
  });

  test('a handler that resolves never calls next()', async () => {
    const next = jest.fn();
    const handler = jest.fn().mockResolvedValue('done');

    await catchAsync(handler)(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  test('a synchronous throw is caught too', async () => {
    const next = jest.fn();

    // Promise.resolve() around the call is what makes this work; without it a
    // synchronous throw would escape the wrapper and crash the process.
    await catchAsync(() => {
      throw new Error('sync failure');
    })(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe('sync failure');
  });
});
