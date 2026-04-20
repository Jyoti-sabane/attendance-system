const validateSession = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Please login first' });
    }
    
    const timeout = 30 * 60 * 1000;
    if (Date.now() - req.session.lastActivity > timeout) {
        req.session.destroy();
        return res.status(401).json({ error: 'Session expired, please login again' });
    }
    
    req.session.lastActivity = Date.now();
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