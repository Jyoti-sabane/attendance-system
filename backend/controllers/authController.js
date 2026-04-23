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
        
        // Save session explicitly
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

const checkSession = async (req, res) => {
    console.log('Check session - Session ID:', req.session.id);
    console.log('Session user:', req.session.user);
    
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
};
