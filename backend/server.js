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

// Trust proxy - REQUIRED for Render
app.set('trust proxy', 1);

// CORS configuration - Allow your frontend
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://attendance-frontend-3m8n.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - FIXED FOR PRODUCTION
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,           // Required for HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'none',       // Required for cross-origin
        domain: '.onrender.com' // Allow cookie across Render subdomains
    },
    name: 'sessionId'
}));

// Debug middleware - log all requests (REMOVE AFTER FIXING)
app.use((req, res, next) => {
    console.log(`\n📌 ${req.method} ${req.url}`);
    console.log(`   Session ID: ${req.session?.id || 'none'}`);
    console.log(`   Session User: ${req.session?.user?.username || 'none'}`);
    console.log(`   Cookie Header: ${req.headers.cookie || 'none'}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
