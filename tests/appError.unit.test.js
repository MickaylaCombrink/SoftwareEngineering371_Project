// Unit tests: no database, no HTTP, no Express. The subject is the class alone.
const AppError = require('../src/utils/AppError');

describe('AppError', () => {
  test('a 4xx is a "fail" and a 5xx is an "error"', () => {
    expect(new AppError('bad input', 400).status).toBe('fail');
    expect(new AppError('boom', 500).status).toBe('error');
  });

  test('every constructed error is marked operational', () => {
    // The global handler leaks a message only when this flag is set, so an
    // unexpected bug can never have its internals exposed.
    expect(new AppError('anything', 400).isOperational).toBe(true);
  });

  test('the stack omits the constructor frame', () => {
    const err = new AppError('trace me', 400);

    expect(err.stack).toBeDefined();
    expect(err.stack).not.toMatch(/new AppError/);
  });

  test.each([
    ['badRequest', 400],
    ['unauthorized', 401],
    ['forbidden', 403],
    ['notFound', 404],
    ['conflict', 409],
    ['unprocessable', 422],
  ])('AppError.%s() carries status %i', (factory, code) => {
    const err = AppError[factory]('message');

    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(code);
    expect(err.message).toBe('message');
  });
});
