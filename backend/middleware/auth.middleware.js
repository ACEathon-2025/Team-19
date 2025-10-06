// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const verifyToken = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const isOfficial = (req, res, next) => {
    if (req.user && req.user.role === 'Official') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Officials only.' });
    }
};

module.exports = { verifyToken, isOfficial };