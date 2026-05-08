const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { isAuthenticated, isUser, isAdmin } = require('../middleware/auth');

// GET - Dashboard (View all blogs)
router.get('/dashboard', isAuthenticated, isUser, async (req, res) => {
    try {
        let blogs;
        
        if (req.user.role === 'admin') {
            // Admin sees all blogs from all users
            blogs = await Blog.find()
                .populate('author', 'firstName lastName email')
                .sort({ dateCreated: -1 });
        } else {
            // Regular user sees only their own blogs
            blogs = await Blog.find({ author: req.user._id })
                .populate('author', 'firstName lastName email')
                .sort({ dateCreated: -1 });
        }
        
        res.render('dashboard', {
            user: req.user,
            isAdmin: req.user.role === 'admin',
            blogs: blogs
        });
        
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/login');
    }
});

// POST - Add new blog
router.post('/blogs/add', isAuthenticated, isUser, async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const newBlog = new Blog({
            title,
            description,
            approveStatus: 'pending',
            author: req.user._id
        });
        
        await newBlog.save();
        
        req.flash('success_msg', 'Blog created. Waiting for admin approval.');
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error creating blog');
        res.redirect('/dashboard');
    }
});

// POST - Approve blog (Admin only)
router.post('/blogs/approve/:id', isAuthenticated, isUser, isAdmin, async (req, res) => {
    try {
        await Blog.findByIdAndUpdate(req.params.id, { approveStatus: 'approved' });
        req.flash('success_msg', 'Blog approved successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error approving blog');
        res.redirect('/dashboard');
    }
});

// POST - Reject blog (Admin only)
router.post('/blogs/reject/:id', isAuthenticated, isUser, isAdmin, async (req, res) => {
    try {
        await Blog.findByIdAndUpdate(req.params.id, { approveStatus: 'rejected' });
        req.flash('success_msg', 'Blog rejected');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error rejecting blog');
        res.redirect('/dashboard');
    }
});

// POST - Delete blog (Admin or author can delete)
router.post('/blogs/delete/:id', isAuthenticated, isUser, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            req.flash('error_msg', 'Blog not found');
            return res.redirect('/dashboard');
        }
        
        // Check if user is admin or the author of the blog
        if (req.user.role !== 'admin' && blog.author.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'You are not authorized to delete this blog');
            return res.redirect('/dashboard');
        }
        
        await Blog.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Blog deleted successfully');
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error deleting blog');
        res.redirect('/dashboard');
    }
});

module.exports = router;