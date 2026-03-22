const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hash password for Signup
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Compare password for Login
const comparePassword = async (password, hashed) => {
    return await bcrypt.compare(password, hashed);
};

// Create the JWT string
const signToken = (userId, email) => {
    return jwt.sign(
        { userId, email }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15d' } // Match this to your cookie maxAge
    );
};

module.exports = { hashPassword, comparePassword, signToken };