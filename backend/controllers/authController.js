const User = require('../models/User');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', username);
        
        const user = await User.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ error: 'Invalid credentials!' });
        }
        
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            console.log('Invalid password for:', username);
            return res.status(401).json({ error: 'Invalid credentials!' });
        }
        
        // Set session data
        req.session.user = {
            user_id: user._id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        };
        req.session.lastActivity = Date.now();
        
        // Save session
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Session error' });
            }
            
            console.log('Login successful for:', username);
            console.log('Session ID:', req.session.id);
            
            res.json({ 
                success: true, 
                role: user.role,
                user: req.session.user,
                redirect: user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'
            });
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
};

const register = async (req, res) => {
    try {
        const { username, password, confirm_password, email, full_name, role } = req.body;
        
        console.log('Registration attempt:', username);
        
        if (password !== confirm_password) {
            return res.status(400).json({ error: 'Passwords do not match!' });
        }
        
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists!' });
        }
        
        const user = new User({ username, password, email, full_name, role });
        await user.save();
        
        console.log('User created:', username);
        res.json({ success: true, message: 'Registration successful! You can now login.' });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
};

const checkSession = (req, res) => {
    if (req.session && req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
};

module.exports = { login, register, logout, checkSession };
