const db = require("../db/queries");
const { validationResult } = require('express-validator');
const { generateTokenAndSetCookie } = require("../utils/token");
const { hashPassword, comparePassword } = require("../utils/authUtils");

// --- GET FORMS ---
const getSignupForm = (req, res) => res.render("signupForm");
const getLoginForm = (req, res) => res.render("loginForm");

// --- LOGIC ---

async function createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('signupForm', { 
            errors: errors.array(), 
            formData: req.body 
        });
    }

    const { email, password, confirmPassword, age, bio } = req.body;

    // Logic-based validation
    if (password !== confirmPassword) {
        return res.status(400).render('signupForm', { 
            errors: [{ msg: "Passwords do not match" }], 
            formData: req.body 
        });
    }

    if (await db.getUserByEmail(email)) {
        return res.status(400).render('signupForm', { 
            errors: [{ msg: "Email already exists" }], 
            formData: req.body 
        });
    }

    // No try/catch needed - Express 5 catches DB or hashing errors automatically
    const hashedPassword = await hashPassword(password);
    const newUser = await db.insertUser({ email, password: hashedPassword, age, bio });

    generateTokenAndSetCookie(newUser.id, newUser.email, res);
    res.status(201).redirect('/');
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const user = await db.getUserByEmail(email);

    // Using our util for a cleaner comparison
    if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).render('loginForm', { 
            errors: [{ msg: "Email or password is incorrect" }], 
            formData: req.body 
        });
    }

    generateTokenAndSetCookie(user.id, user.email, res);
    res.redirect('/');
}

async function logoutUser(req, res) {
    res.clearCookie('jwt');
    res.redirect('/login');
}

module.exports = { 
    getSignupForm, 
    createUser, 
    getLoginForm, 
    loginUser, 
    logoutUser 
};