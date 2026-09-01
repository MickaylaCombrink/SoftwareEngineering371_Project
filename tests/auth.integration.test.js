/**
 * PERSON 2 — Login and Security.  NOT IMPLEMENTED.
 *
 * test.todo() entries keep `npm test` green while the suite is empty —
 * jest fails a file that contains no tests at all. Replace each one with
 * a real test as you build the feature.
 *
 * Follow the setup in tests/errorHandling.integration.test.js: spin up
 * mongodb-memory-server in beforeAll, drive the API with supertest.
 */

test.todo('register with a valid body -> 201 and a token');
test.todo('register with an email already in use -> 409, no second user created');
test.todo('register with a 6-character password -> 400 with a validation message');
test.todo('login with correct credentials -> 200 and a token');
test.todo('login with an incorrect password -> 401');
test.todo('login with an unknown email -> 401 with the same message (no enumeration)');
test.todo('the stored password is a hash, never the plain text');
test.todo('GET /me without a token -> 401');
test.todo('GET /me with an expired token -> 401');
test.todo('refresh with a valid refresh token -> a new access token');
test.todo('logout invalidates the refresh token');
test.todo('a customer calling an admin-only route -> 403 via restrictTo');
