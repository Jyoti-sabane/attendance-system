const User = require('../models/User');
const { generateToken } = require('../middleware/authJWT');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', username);
        
        const user = await User.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials!' });
        }
        
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials!' });
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        console.log('Login successful:', username);
        
        res.json({ 
            success: true, 
            role: user.role,
            user: {
                user_id: user._id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            },
            token: token,
            redirect: user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'
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
    res.json({ success: true, message: 'Logged out successfully' });
};

const checkSession = (req, res) => {
    // This will be handled by token verification
    res.json({ authenticated: false });
};

module.exports = { login, register, logout, checkSession };
