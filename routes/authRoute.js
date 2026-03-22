const express = require('express');
const Router = express.Router;
const {body, validationResult} = require('express-validator');

const authRouter = Router();
const authController = require('../controllers/authController');

const signupValidationRules = [
    body('email').trim().notEmpty().isEmail().withMessage('Email must be a valid email address'),
    body('password').trim().notEmpty().isLength({ min: 6, max: 255 }).withMessage('Password must be 2-255 characters'),
    body('confirmPassword').trim().notEmpty().isLength({ min: 6, max: 255 }).withMessage('Confirm Password must be 2-255 characters'),
    body('age').trim().isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
    body('bio').trim().isLength({ min: 2, max: 255 }).withMessage('Bio must be 2-255 characters')
]

const loginValidationRules = [
    body('password').trim().notEmpty().isLength({ min: 6, max: 255 }).withMessage('Password must be 2-255 characters'),
    body('email').trim().notEmpty().isEmail().withMessage('Email must be a valid email address')
]


authRouter.get('/signup', authController.getSignupForm);
authRouter.post('/signup', signupValidationRules, authController.createUser);

authRouter.get('/login', authController.getLoginForm);
authRouter.post('/login', loginValidationRules, authController.loginUser);

authRouter.get('/logout', authController.logoutUser);

module.exports = authRouter;