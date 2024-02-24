const express = require('express');
const controller = require('../controllers/usercontroller.js');
const router = express.Router();
const db = require('../utils/dbconn.js');
const { body } = require('express-validator');

router.get('/', controller.renderHome);

// Route for displaying signup form
router.get('/signin', controller.renderSigninForm);

// Route for displaying signup form
router.get('/signup', controller.renderSignupForm);

// Route for handling signup form submission
router.get('/signout', controller.getSignout);

// Route for handling signup form submission
router.post('/signup', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters long')
        .isAlphanumeric().withMessage('Username can only contain letters and numbers'),
    body('firstName')
        .trim()
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long')
        .isAlpha().withMessage('First name can only contain alphabetic characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long')
        .isAlpha().withMessage('Last name can only contain alphabetic characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .trim()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], controller.signupPost);

router.post('/signin', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
], controller.signinPost);


module.exports = router;