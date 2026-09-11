const { z } = require('zod');
const prisma = require('../../config/database');
const { ValidationError, NotFoundError } = require('../../common/errors/AppError');

const productSelect = {
  id: true,
  name: true,
  sku: true,
  price: true,
  stock: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  sku: z.string().min(1, 'SKU is required').max(50),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().uuid('Invalid category ID'),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
}).refine(obj => Object.keys(obj).length > 0, 'At least one field must be updated');

class ProductService {
  static async getAllProducts(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          select: productSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count(),
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      throw new Error('Failed to fetch products');
    }
  }

  static async getProductById(id) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid product ID');
    }

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        select: productSelect,
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      return product;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to fetch product');
    }
  }

  static async getProductsByCategoryId(categoryId, page = 1, limit = 20) {
    if (!categoryId || typeof categoryId !== 'string') {
      throw new ValidationError('Invalid category ID');
    }

    try {
      const skip = (page - 1) * limit;

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { categoryId },
          select: productSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where: { categoryId } }),
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to fetch products by category');
    }
  }

  static async searchProducts(query, page = 1, limit = 20) {
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Search query is required');
    }

    try {
      const skip = (page - 1) * limit;
      const searchTerm = `%${query}%`;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: productSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      throw new Error('Failed to search products');
    }
  }

  static async createProduct(data) {
    try {
      const validated = createProductSchema.parse(data);

      const existingSku = await prisma.product.findUnique({
        where: { sku: validated.sku },
      });

      if (existingSku) {
        throw new ValidationError('Product with this SKU already exists');
      }

      const category = await prisma.category.findUnique({
        where: { id: validated.categoryId },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const product = await prisma.product.create({
        data: validated,
        select: productSelect,
      });

      return product;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.issues?.[0]?.message || 'Validation failed';
        throw new ValidationError(`Validation failed: ${msg}`);
      }
      if (err instanceof ValidationError || err instanceof NotFoundError) throw err;
      throw new Error('Failed to create product');
    }
  }

  static async updateProduct(id, data) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid product ID');
    }

    try {
      const validated = updateProductSchema.parse(data);

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (validated.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: validated.categoryId },
        });

        if (!category) {
          throw new NotFoundError('Category not found');
        }
      }

      const updated = await prisma.product.update({
        where: { id },
        data: validated,
        select: productSelect,
      });

      return updated;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.issues?.[0]?.message || 'Validation failed';
        throw new ValidationError(`Validation failed: ${msg}`);
      }
      if (err instanceof ValidationError || err instanceof NotFoundError) throw err;
      throw new Error('Failed to update product');
    }
  }

  static async deleteProduct(id) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid product ID');
    }

    try {
      const deleted = await prisma.product.delete({
        where: { id },
        select: productSelect,
      });

      return deleted;
    } catch (err) {
      if (err && err.code === 'P2025') {
        throw new NotFoundError('Product not found');
      }
      throw new Error('Failed to delete product');
    }
  }
}

module.exports = ProductService;
