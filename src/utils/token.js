/**
 * PERSON 2 — Login and Security.  NOT IMPLEMENTED.
 *
 * Sign and verify the access and refresh tokens. Standalone: this file
 * has no dependency on the rest of the skeleton.
 *
 * Expected exports (other files will import these names):
 *   signAccessToken(payload)   -> string
 *   signRefreshToken(payload)  -> string
 *   verifyAccessToken(token)   -> decoded payload, throws on failure
 *   verifyRefreshToken(token)  -> decoded payload, throws on failure
 *
 * Environment variables are already declared in .env.example:
 *   JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
 *
 * `jsonwebtoken` is already a dependency.
 */


//call dependancy
const jwt = require('jsonwebtoken');

//Tokens
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Signing
function signAccessToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}

function signRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

function generateTokens(user) {
    const payload = {sub: user.id, role: user.role};
    const accessToken = signAccessToken (payload);
    const refreshToken = signRefreshToken(payload);
    return {accessToken, refreshToken};
}

//Verification

function verifyAccessToken(token) {

        return jwt.verify(token, ACCESS_TOKEN_SECRET);
 
}

function verifyRefreshToken(token) {

    return jwt.verify(token, REFRESH_TOKEN_SECRET);

}

//Refresh
function refreshAccessToken(refreshToken) {
    const decoded = verifyAccessToken(refreshToken);
    if (!decoded) {
throw new Error('Invalid or expired refresh token')
    }

    return signAccessToken ({ sub: decoded.sub, role:decoded.role});

}



module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
