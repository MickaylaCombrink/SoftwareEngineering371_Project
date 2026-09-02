/**
 * PERSON 2 — Login and Security.
 *
 * Sign and verify the access and refresh tokens. Standalone: this file
 * has no dependency on the rest of the skeleton.
 *
 * Two independent secrets are used so a leaked access token can never be
 * replayed as a refresh token and vice versa (see the System Plan's
 * configuration section — refresh falls back to the access secret only
 * when JWT_REFRESH_SECRET is left unset).
 */
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
