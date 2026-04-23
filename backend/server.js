const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - Allow your frontend
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://attendance-frontend-3m8n.onrender.com',
        'https://attendance-system-hlpr.onrender.com'
    ],
    credentials: true,  // THIS IS CRITICAL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - FIXED FOR PRODUCTION
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key_change_this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,  // IMPORTANT: Set to true for HTTPS (Render uses HTTPS)
        httpOnly: true,
        maxAge: 30 * 60 * 1000,  // 30 minutes
        sameSite: 'none',  // IMPORTANT: 'none' allows cross-site requests
        domain: '.onrender.com'  // Allow cookies across Render subdomains
    },
    proxy: true  // Trust the proxy (Render uses proxies)
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
