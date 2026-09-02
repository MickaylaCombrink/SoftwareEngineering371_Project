/**
 * UNASSIGNED — Orders.  NOT IMPLEMENTED.
 *
 * No brief covers this yet; it needs an owner. Depends on both Person 2
 * (auth) and Person 3 (cart).
 *
 * Checkout: read the user's cart, verify stock, snapshot each line item's
 * price into the order, decrement stock, empty the cart. Do it in a Mongo
 * transaction so a failure partway cannot decrement stock without creating
 * the order.
 *
 * Already written for you:
 *   productRepository.decrementStock(id, qty, { session })
 *     -> atomic, returns null instead of overselling
 *   orderRepository.findByUser(userId)          -> history, newest first
 *   orderRepository.findByIdForUser(id, userId, { isAdmin })
 *     -> returns null for a non-owner, so no order data can leak
 *
 * Test case from the plan: a product's price changing after an order is
 * placed must NOT change the historic order — that is why Order line items
 * carry their own unitPrice.
 */

module.exports = {};
