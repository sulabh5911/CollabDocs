const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  // Demo authentication mechanism:
  // We trust the client to send the selected demo user's email.
  // In a real application, this would be a secure, signed token (e.g., JWT or session cookie).
  const email = req.header('X-Demo-User-Email');
  if (!email) {
    return res.status(401).json({ error: 'Authentication required. Missing X-Demo-User-Email header.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid demo user.' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

module.exports = { requireAuth };
