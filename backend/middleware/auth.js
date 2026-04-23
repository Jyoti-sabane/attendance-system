const validateSession = (req, res, next) => {
    console.log('Validating session...');
    console.log('Session ID:', req.session?.id);
    console.log('Session user:', req.session?.user);
    
    if (!req.session || !req.session.user) {
        console.log('No session found, returning 401');
        return res.status(401).json({ error: 'Please login first' });
    }
    
    // Check session timeout (30 minutes)
    const timeout = 30 * 60 * 1000;
    if (Date.now() - req.session.lastActivity > timeout) {
        console.log('Session expired');
        req.session.destroy();
        return res.status(401).json({ error: 'Session expired, please login again' });
    }
    
    // Update last activity
    req.session.lastActivity = Date.now();
    console.log('Session validated for user:', req.session.user.username);
    next();
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

const isStaff = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'staff') {
        next();
    } else {
        res.status(403).json({ error: 'Staff access required' });
    }
};

module.exports = { validateSession, isAdmin, isStaff };
