const express = require('express');
const expressSession = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');

require('dotenv').config();  
const connectDb = require('./config/db');

// Importing models
const User = require('./models/User');

// Instantations
const app = express();
const port = 3000;

// Configurations
connectDb();

// Setting the templating engine to pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));  // ADD THIS LINE

// Middleware
app.use(express.static(path.join(__dirname, 'public')));  // REMOVED the duplicate views line
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport configurations
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global variable to make logged in users available to all pug templates
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');  // FIXED TYPO: sucess_msg -> success_msg
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/blogRoutes'));



// Last chunk of code
app.listen(port, () => console.log(`listening on port ${port}`));