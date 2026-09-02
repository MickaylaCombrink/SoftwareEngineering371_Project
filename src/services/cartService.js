/**
 * PERSON 3 — Shopping Cart API.  NOT IMPLEMENTED.
 *
 * Business rules live here, not in the controller: add item, change
 * quantity, remove item, calculate totals.
 *
 * Use CartRepository and ProductRepository rather than the models:
 *   const { cartRepository, productRepository } = require('../repositories');
 *   cartRepository.findOrCreateByUser(userId)  -> no "no cart yet" special case
 *   cartRepository.clear(userId)               -> empty after checkout
 *   productRepository.findById(productId)      -> for the stock check
 *
 * Test cases from the plan this has to satisfy:
 *   - adding a quantity above available stock -> 422, cart UNCHANGED
 *     (check stock before mutating anything and return early)
 *   - adding the same product twice -> quantities combine into one line
 *     item, subtotal correct
 *
 * Note: cart line items store a `unitPrice` copy. Decide whether totals
 * use that copy or the live product price, and be consistent.
 */

module.exports = {};
