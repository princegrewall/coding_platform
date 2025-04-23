const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    // Check for token in cookies first (preferred method)
    let token = req.cookies?.auth_token;
    
    // If not in cookies, check in Authorization header for backward compatibility
    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        } else {
            token = authHeader; // For backward compatibility
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Authentication required. Please log in.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        return res.status(403).json({ 
            success: false,
            message: 'Invalid or expired authentication token' 
        });
    }
};

module.exports = ensureAuthenticated;