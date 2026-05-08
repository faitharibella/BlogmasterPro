const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Home route (ADD THIS)
app.get('/', (req, res) => {
    res.render('index');
});

// GET - Register page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// POST - Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, role } = req.body;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.render('register', { error: 'Passwords do not match' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.render('register', { error: 'Email already registered' });
        }
        
        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            role: role || 'user'
        });
        
        // Register user with password (passport-local-mongoose handles hashing)
        await User.register(newUser, password);
        
        req.flash('success_msg', 'Registration successful. Please login.');
        res.redirect('/login');
        
    } catch (error) {
        console.error(error);
        res.render('register', { error: error.message || 'Something went wrong' });
    }
});

// GET - Login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// POST - Login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// GET - Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        req.flash('success_msg', 'You have been logged out');
        res.redirect('/login');
    });
});

module.exports = router;