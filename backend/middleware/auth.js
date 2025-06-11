const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    if (!req.header('Authorization')) {
      throw new Error('No Authorization header');
    }
    
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log('Verifying token:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    console.log('Decoded token:', decoded);
    
    const user = await User.findOne({ _id: decoded.userId });
    console.log('Found user:', user ? user._id : 'not found');

    if (!user) {
      throw new Error('User not found');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      message: 'Please authenticate',
      error: error.message 
    });
  }
};

module.exports = auth; 