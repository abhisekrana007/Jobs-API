const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId, // Standardized to userId
            name: decoded.name,
            email: decoded.email // Added if needed for future use
        };
        next();
    } catch (error) {
        // Specific error messages for development, generic for production
        const message = process.env.NODE_ENV === 'production'
            ? 'Authentication invalid'
            : error.message;
        return res.status(401).json({ error: message });
    }
};

module.exports = authMiddleware;