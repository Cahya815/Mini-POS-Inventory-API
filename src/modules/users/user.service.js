const { z } = require('zod');
const prisma = require('../../config/database');
const { ValidationError, NotFoundError } = require('../../common/errors/AppError');

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

const roleSchema = z.enum(['ADMIN', 'MANAGER', 'CASHIER']);

class UserService {
  static async getAllUsers() {
    try {
      return await prisma.user.findMany({
        select: userSelect,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      throw new Error('Failed to fetch users');
    }
  }

  static async getUserById(id) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid user ID');
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to fetch user');
    }
  }

  static async updateUserRole(id, role) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid user ID');
    }

    try {
      const validatedRole = roleSchema.parse(role);

      const updated = await prisma.user.update({
        where: { id },
        data: { role: validatedRole },
        select: userSelect,
      });

      return updated;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.issues?.[0]?.message || 'Unknown error';
        throw new ValidationError(`Invalid role: ${msg}`);
      }
      throw new Error('Failed to update user role');
    }
  }

  static async deleteUser(id) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid user ID');
    }

    try {
      const deleted = await prisma.user.delete({
        where: { id },
        select: userSelect,
      });

      return deleted;
    } catch (err) {
      if (err && err.code === 'P2025') {
        throw new NotFoundError('User not found');
      }
      throw new Error('Failed to delete user');
    }
  }
}

module.exports = UserService;
