/**
 * PERSON 3 — Shopping Cart API.  NOT IMPLEMENTED.
 *
 * test.todo() entries keep `npm test` green while the suite is empty —
 * jest fails a file that contains no tests at all. Replace each one with
 * a real test as you build the feature.
 *
 * Follow the setup in tests/errorHandling.integration.test.js: spin up
 * mongodb-memory-server in beforeAll, drive the API with supertest.
 */

test.todo('GET /api/cart for a new user -> 200 with an empty cart');
test.todo('adding an item -> 200, the item is in the cart');
test.todo('adding the same product twice -> one line item, quantities combined');
test.todo('adding a quantity above available stock -> 422, cart unchanged');
test.todo('changing quantity to a valid number -> 200 with the new quantity');
test.todo('changing quantity below 1 -> 400');
test.todo('removing an item -> it is gone from the cart');
test.todo('removing an item that is not in the cart -> 404');
test.todo('the cart total is the sum of unitPrice * quantity');
test.todo('any cart route without a token -> 401');
