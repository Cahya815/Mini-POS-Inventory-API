const AuthService = require('../../modules/auth/auth.service');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization token');
    }

    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);

    req.user = user;
    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { authMiddleware };
