/**
 * PERSON 2 — Login and Security.  NOT IMPLEMENTED.
 *
 * HTTP concerns only — no queries in here. Use UserRepository:
 *   const { userRepository } = require('../repositories');
 *   userRepository.emailExists(email)              -> duplicate check (409)
 *   userRepository.findByEmailWithPassword(email)  -> login (includes the hash)
 *   userRepository.create({ ... })                 -> register
 *
 * Handlers to write: register, login, refresh, logout, getMe.
 *
 * Wrap every handler in catchAsync so rejections reach the error handler:
 *   const catchAsync = require('../utils/catchAsync');
 *
 * Hash with bcryptjs (already a dependency) before storing — the User
 * schema does NOT hash for you.
 *
 * Test cases from the plan this has to satisfy:
 *   - register with an email already in use  -> 409, no second user created
 *   - register with a 6-character password   -> 400 with a validation message
 *   - login with a wrong password            -> 401
 *   - login with an unknown email            -> 401 with the SAME message,
 *                                               so emails cannot be enumerated
 */

module.exports = {};
