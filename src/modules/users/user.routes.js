const { Router } = require('express');
const { getAllUsers, getUserById, updateUserRole, deleteUser } = require('./user.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');
const { roleMiddleware } = require('../../common/middleware/roleMiddleware');

const router = Router();

// GET /api/v1/users - Get all users (Admin/Manager only)
router.get('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), getAllUsers);

// GET /api/v1/users/:id - Get user by ID (Admin/Manager only)
router.get('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), getUserById);

// PATCH /api/v1/users/:id/role - Update user role (Admin only)
router.patch('/:id/role', authMiddleware, roleMiddleware('ADMIN'), updateUserRole);

// DELETE /api/v1/users/:id - Delete user (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteUser);

module.exports = router;
