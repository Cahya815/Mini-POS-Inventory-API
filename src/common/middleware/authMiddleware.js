const AuthService = require('../../modules/auth/auth.service');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Optional auth — only verify if token is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);

    req.user = user;
    next();
  } catch (err) {
    // Invalid token — set req.user to null so roleMiddleware can reject
    req.user = null;
    next();
  }
};

module.exports = { authMiddleware };
