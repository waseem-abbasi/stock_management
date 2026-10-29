const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
 
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_stock_management_2026');
    const currentUA = req.headers['user-agent'] || '';

    // Verify session belongs to the same browser agent
    if (decoded.ua && currentUA && decoded.ua !== currentUA) {
      return res.status(401).json({
        success: false,
        message: 'Security Notice: Session is not valid in a different browser. Please sign in.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have sufficient permissions to perform this action.',
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
