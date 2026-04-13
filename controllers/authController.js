const db = require("../db/queries");
const { validationResult } = require('express-validator');
const { generateTokenAndSetCookie } = require("../utils/token");
const { hashPassword, comparePassword } = require("../utils/authUtils");

async function createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, confirmPassword, age, bio } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ errors: [{ msg: "Passwords do not match" }] });
    }

    if (await db.getUserByEmail(email)) {
        return res.status(400).json({ errors: [{ msg: "Email already exists" }] });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await db.insertUser({ email, password: hashedPassword, age, bio });

    generateTokenAndSetCookie(newUser.id, newUser.email, res);
    res.status(201).json({ message: 'Account created', user: { id: newUser.id, email: newUser.email } });
}

async function loginUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await db.getUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ errors: [{ msg: "Email or password is incorrect" }] });
    }

    generateTokenAndSetCookie(user.id, user.email, res);
    res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
}

async function logoutUser(req, res) {
    res.clearCookie('jwt');
    res.json({ message: 'Logged out' });
}

async function getMe(req, res) {
    res.json({ user: res.locals.user });
}

module.exports = { createUser, loginUser, logoutUser, getMe };
