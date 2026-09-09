const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { userRepository, refreshTokenRepository } = require('../repositories');

// Helpers

const emailInUseMessage = 'Incorrect email or password.';

const MIN_PASSWORD_LENGTH = 8;

async function findByCredentials(email, password) {
  const user = await userRepository.findByEmailWithPassword(email);
  // Same result whether or not the email exists, so it cannot be used to enumerate accounts
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
}

// Length is checked on the plaintext, before hashing
function validatePassword(password) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw AppError.badRequest(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
    );
  }
}

// Never return the password hash
function publicUser(user) {
  const doc = user.toObject ? user.toObject() : user;
  const rest = { ...doc };
  delete rest.password;
  return rest;
}

// Signs a refresh token and records it, using the token's own exp claim as
// the row's expiry so the two can never disagree.
//
// The jti matters: a JWT is a pure function of its payload, and iat has only
// second resolution, so two tokens signed for the same user in the same second
// would be byte-identical and collide on the tokenHash unique index. A random
// jti makes every issued token distinct.
async function issueRefreshToken(user) {
  const refreshToken = signRefreshToken({
    id: user.id,
    role: user.role,
    jti: crypto.randomUUID(),
  });
  const { exp } = verifyRefreshToken(refreshToken);

  await refreshTokenRepository.issue(user.id, refreshToken, new Date(exp * 1000));

  return refreshToken;
}

async function sendTokens(res, user, statusCode = 200) {
  const payload = { id: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = await issueRefreshToken(user);

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    refreshToken,
    data: { user: publicUser(user) },
  });
}

// Handlers

// POST /api/auth/register
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (await userRepository.emailExists(email)) {
    // Checked explicitly so a duplicate never reaches the hashing step
    return next(
      AppError.conflict('An account with that email already exists.')
    );
  }

  validatePassword(password);

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await userRepository.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    // Role is never taken from the request body: that would allow self-promotion to admin
    role: 'customer',
  });

  await sendTokens(res, user, 201);
});

// POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(AppError.badRequest('Please provide an email and a password.'));
  }

  const user = await findByCredentials(email, password);
  if (!user) {
    return next(AppError.unauthorized(emailInUseMessage));
  }

  await sendTokens(res, user);
});

// POST /api/auth/refresh
exports.refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  // Checked against the stored allow-list as well as the signature, so a
  // revoked token is rejected even while it is still cryptographically valid
  if (!refreshToken || !(await refreshTokenRepository.isActive(refreshToken))) {
    return next(AppError.unauthorized('Invalid or expired refresh token.'));
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    return next(AppError.unauthorized('Invalid or expired refresh token.'));
  }

  const user = await userRepository.findById(decoded.id);
  if (!user) {
    return next(AppError.unauthorized('The user belonging to this token no longer exists.'));
  }

  // Rotation: the presented token is revoked before the replacement is issued,
  // so it can never be used twice
  await refreshTokenRepository.revoke(refreshToken);

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const newRefreshToken = await issueRefreshToken(user);

  res.status(200).json({
    status: 'success',
    token: accessToken,
    refreshToken: newRefreshToken,
  });
});

// POST /api/auth/logout
exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  // Always 200: an unknown or already-revoked token is not an error, and
  // reporting the difference would leak which tokens exist
  if (refreshToken) {
    await refreshTokenRepository.revoke(refreshToken);
  }

  res.status(200).json({ status: 'success' });
});

// GET /api/auth/me (protect)
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
});
