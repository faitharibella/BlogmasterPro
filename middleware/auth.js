// Check if user is authenticated (logged in)
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/login');
}

// Check if user is a regular user (for the 3 users)
function isUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/login');
}

// Check if user is admin (for the 1 admin)
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Admin only.');
    res.redirect('/dashboard');
}

module.exports = { isAuthenticated, isUser, isAdmin };