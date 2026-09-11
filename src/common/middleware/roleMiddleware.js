const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
      }

      if (allowedRoles.length === 0) {
        // No role restriction; allow all authenticated users
        return next();
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          },
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = roleMiddleware;
