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

const bcrypt = require('bcryptjs');
const {userRepository} = require('../repositories');
const catchAsync =  require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { signAccessToken, signRefreshToken, verifyRefreshToken} = require('../utils/token');

const SALT_ROUND = 12;

const INVALID_CREDENTIALS = 'Email or Password is Incorrect';

exports.register = catchAsync(async(req,res, next) =>{
    const {email, password, ...rest} = req.body;

    if (!password || password.length < 8) {
        return next (new AppError('Password must be at least 8 characters', 400))
    }

    const exists = await userRepository.emailExists(email);
    if (exists) {
        return next (new AppError('An account with this email already exists', 409))
    }

const passwordHashed = await bcrypt.hash(password, SALT_ROUND);

const user = await userRepository.create({
    email, 
    password: passwordHashed, 
    ...rest,
})

const accessToken = signAccessToken({sub: user.id, role: user.role});
const refreshToken = signRefreshToken({sub: user.id, role: user.role});

res.status(201).json({
    status: 'Success', 
    accessToken, 
    refreshToken, 
    data: {user: {id: user.id, email: user.email, role: user.role}},

    });

});

exports.login = catchAsync(async (req, res, next) =>
{
    const {email, password} = req.body

    if (!email || !password) {
        return next(new AppError(INVALID_CREDENTIALS, 401));
    }

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
        return next(new AppError(INVALID_CREDENTIALS, 401));
    }

    const accessToken = signAccessToken({sub: user.id, role: user.role});
    const refreshToken = signRefreshToken({sub: user.id, role: user.role});

    res.status(200).json({
        status: 'Success',
        accessToken,
        refreshToken,
        data: {user: {id: user.id, email: user.email, role: user.role}},
    });
});


exports.refresh = catchAsync(async(res, req, next) =>{
    const {refreshToken} = req.body;
    if (!refreshToken) {
        return next(new AppError('Refresh Token Required', 401))
    }

    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({sub: decoded.sub, role: decoded.role});
    
    res.status(200).json({
        status: 'Success',
        accessToken
    });
});


exports.logout = catchAsync(async (res, req, next) =>{
res.status(200).json({status: 'success'})
});

exports.getMe = catchAsync(async (res, req, next) =>{
res.status(200).json({
    status: 'success',
    data: {user: req.user},
});
});

