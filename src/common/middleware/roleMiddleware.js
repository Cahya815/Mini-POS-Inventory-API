const { AppError } = require('../errors/AppError');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};

module.exports = { roleMiddleware };
