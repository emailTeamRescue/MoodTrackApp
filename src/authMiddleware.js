const jwt = require('jsonwebtoken');

// Authorization middleware
// This will authorize a request based on the token available in header

const authMiddleware = async(req, res, next) => {
    try{
        // removes additional text from token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if(!token) {
            return res.status(401).json({error: 'Authentication required'});
        }
        // Verify the token based on Secret available in env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    }
    catch(error) {
        res.status(401).json({error: 'Invalid token'});
    }
};

module.exports = authMiddleware;