const UserService = require('./user.service');
const prisma = require('../../config/database');
const { ValidationError, NotFoundError } = require('../../common/errors/AppError');

jest.mock('../../config/database', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockUserData = {
  id: 'test-id-123',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'CASHIER',
  createdAt: new Date('2026-09-10'),
};

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users sorted by createdAt desc', async () => {
      const mockUsers = [mockUserData];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await UserService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw error when database fails', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(UserService.getAllUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUserById', () => {
    it('should return user when id is valid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserData);

      const result = await UserService.getUserById('test-id-123');

      expect(result).toEqual(mockUserData);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should throw ValidationError when id is invalid', async () => {
      await expect(UserService.getUserById('')).rejects.toThrow(ValidationError);
      await expect(UserService.getUserById(null)).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(UserService.getUserById('test-id-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role when role is valid', async () => {
      const updatedUser = { ...mockUserData, role: 'ADMIN' };
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await UserService.updateUserRole('test-id-123', 'ADMIN');

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should throw ValidationError when id is invalid', async () => {
      await expect(UserService.updateUserRole('', 'ADMIN')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when role is invalid', async () => {
      await expect(UserService.updateUserRole('test-id-123', 'INVALID_ROLE')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw error when update fails', async () => {
      prisma.user.update.mockRejectedValue(new Error('DB Error'));

      await expect(UserService.updateUserRole('test-id-123', 'ADMIN')).rejects.toThrow(
        'Failed to update user role'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user when id is valid', async () => {
      prisma.user.delete.mockResolvedValue(mockUserData);

      const result = await UserService.deleteUser('test-id-123');

      expect(result).toEqual(mockUserData);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should throw ValidationError when id is invalid', async () => {
      await expect(UserService.deleteUser('')).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when user does not exist (P2025)', async () => {
      prisma.user.delete.mockRejectedValue({ code: 'P2025' });

      await expect(UserService.deleteUser('test-id-123')).rejects.toThrow(NotFoundError);
    });

    it('should throw error when delete fails', async () => {
      prisma.user.delete.mockRejectedValue(new Error('DB Error'));

      await expect(UserService.deleteUser('test-id-123')).rejects.toThrow('Failed to delete user');
    });
  });
});
