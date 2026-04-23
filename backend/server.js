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

// Trust proxy - CRITICAL for Render
app.set('trust proxy', 1);

// CORS configuration
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
        secure: true,           // HTTPS only
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'none',       // Required for cross-site requests
        domain: '.onrender.com' // Allow across Render subdomains
    },
    name: 'sessionId',
    proxy: true
}));

// Debug middleware - log all requests and session
app.use((req, res, next) => {
    console.log(`\n📌 ${req.method} ${req.url}`);
    console.log(`   Session ID: ${req.session?.id}`);
    console.log(`   Session User: ${req.session?.user?.username || 'none'}`);
    console.log(`   Cookies: ${req.headers.cookie || 'none'}`);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
