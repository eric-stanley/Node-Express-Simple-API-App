const express = require('express');
const validator = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', [
    validator.body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User
                .findOne({
                    email: value
                })
                .then(userDoc => {
                    if(userDoc) {
                        return Promise.reject('Email address already exists');
                    }
                })
                .catch(err => {
                    if(!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                })
        })
        .normalizeEmail(),
    validator
        .body('password')
        .trim()
        .isLength({ min: 5 }),
    validator
        .body('name')
        .trim()
        .not()
        .isEmpty()
], authController.signup);

router.post('/login', [
    validator
        .body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    validator
        .body('password')
        .trim()
        .isLength({ min: 5 })
], authController.login);

module.exports = router;
