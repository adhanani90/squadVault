const { signToken } = require('./authUtils');

const generateTokenAndSetCookie = (userId, email, res) => {
    // 1. Generate the string using our util
    const token = signToken(userId, email);

    // 2. Set the cookie
    res.cookie('jwt', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    });
};

module.exports = { generateTokenAndSetCookie };