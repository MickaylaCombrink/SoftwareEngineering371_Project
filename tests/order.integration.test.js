/**
 * UNASSIGNED — Orders.  NOT IMPLEMENTED.
 *
 * test.todo() entries keep `npm test` green while the suite is empty.
 */

test.todo('successful checkout -> 201, stock decremented, cart emptied');
test.todo('checkout with an empty cart -> 400');
test.todo('checkout when stock ran out -> 422, nothing committed');
test.todo('a price change after checkout does not alter the historic order');
test.todo('GET /api/orders returns only my orders, newest first');
test.todo("requesting another user's order by id -> 403, no order data returned");
test.todo('an admin can read any order');
test.todo('updating order status as a customer -> 403');
