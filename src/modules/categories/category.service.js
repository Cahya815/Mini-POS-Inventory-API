const { z } = require('zod');
const prisma = require('../../config/database');
const { ValidationError, NotFoundError } = require('../../common/errors/AppError');

const categorySelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(255),
});

class CategoryService {
  static async getAllCategories() {
    try {
      return await prisma.category.findMany({
        select: categorySelect,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      throw new Error('Failed to fetch categories');
    }
  }

  static async getCategoryById(id) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid category ID');
    }

    try {
      const category = await prisma.category.findUnique({
        where: { id },
        select: categorySelect,
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      return category;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to fetch category');
    }
  }

  static async createCategory(data) {
    try {
      const validated = createCategorySchema.parse(data);

      const category = await prisma.category.create({
        data: validated,
        select: categorySelect,
      });

      return category;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.issues?.[0]?.message || 'Validation failed';
        throw new ValidationError(`Validation failed: ${msg}`);
      }
      throw new Error('Failed to create category');
    }
  }

  static async updateCategory(id, data) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid category ID');
    }

    try {
      const validated = updateCategorySchema.parse(data);

      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const updated = await prisma.category.update({
        where: { id },
        data: validated,
        select: categorySelect,
      });

      return updated;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.issues?.[0]?.message || 'Validation failed';
        throw new ValidationError(`Validation failed: ${msg}`);
      }
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to update category');
    }
  }

  static async deleteCategory(id) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid category ID');
    }

    try {
      // Check if category has products
      const productsCount = await prisma.product.count({
        where: { categoryId: id },
      });

      if (productsCount > 0) {
        throw new ValidationError('Cannot delete category with existing products');
      }

      const deleted = await prisma.category.delete({
        where: { id },
        select: categorySelect,
      });

      return deleted;
    } catch (err) {
      if (err && err.code === 'P2025') {
        throw new NotFoundError('Category not found');
      }
      if (err instanceof ValidationError) throw err;
      throw new Error('Failed to delete category');
    }
  }
}

module.exports = CategoryService;
