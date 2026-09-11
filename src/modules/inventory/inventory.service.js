const { z } = require('zod');
const prisma = require('../../config/database');
const { ValidationError, NotFoundError } = require('../../common/errors/AppError');

const MovementType = {
  STOCK_IN: 'STOCK_IN',
  SALE: 'SALE',
  ADJUSTMENT: 'ADJUSTMENT',
};

const inventoryMovementSelect = {
  id: true,
  productId: true,
  type: true,
  quantity: true,
  previousStock: true,
  newStock: true,
  createdBy: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      name: true,
      sku: true,
    },
  },
};

const recordMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  type: z.enum([MovementType.STOCK_IN, MovementType.ADJUSTMENT]),
  quantity: z.number().int().positive('Quantity must be positive'),
});

class InventoryService {
  static async getMovementHistory(productId, page = 1, limit = 20) {
    if (!productId || typeof productId !== 'string') {
      throw new ValidationError('Invalid product ID');
    }

    try {
      const skip = (page - 1) * limit;

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const [movements, total] = await Promise.all([
        prisma.inventoryMovement.findMany({
          where: { productId },
          select: inventoryMovementSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.inventoryMovement.count({ where: { productId } }),
      ]);

      return {
        data: movements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to fetch movement history');
    }
  }

  static async getAllMovements(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [movements, total] = await Promise.all([
        prisma.inventoryMovement.findMany({
          select: inventoryMovementSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.inventoryMovement.count(),
      ]);

      return {
        data: movements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      throw new Error('Failed to fetch movements');
    }
  }

  static async recordMovement(data, userId) {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('User ID is required');
    }

    try {
      const validated = recordMovementSchema.parse(data);

      const movement = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: validated.productId },
        });

        if (!product) {
          throw new NotFoundError('Product not found');
        }

        const previousStock = product.stock;
        const newStock = previousStock + validated.quantity;

        if (validated.type === MovementType.ADJUSTMENT && newStock < 0) {
          throw new ValidationError(
            `Cannot adjust stock: would result in negative stock (current: ${previousStock}, adjustment: ${validated.quantity})`
          );
        }

        await tx.product.update({
          where: { id: validated.productId },
          data: { stock: newStock },
        });

        const createdMovement = await tx.inventoryMovement.create({
          data: {
            productId: validated.productId,
            type: validated.type,
            quantity: validated.quantity,
            previousStock,
            newStock,
            createdBy: userId,
          },
          select: inventoryMovementSelect,
        });

        return createdMovement;
      });

      return movement;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.issues?.[0]?.message || 'Validation failed';
        throw new ValidationError(`Validation failed: ${msg}`);
      }
      if (err instanceof ValidationError || err instanceof NotFoundError) throw err;
      throw new Error('Failed to record inventory movement');
    }
  }

  static async getProductStock(productId) {
    if (!productId || typeof productId !== 'string') {
      throw new ValidationError('Invalid product ID');
    }

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          categoryId: true,
        },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      return product;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to fetch product stock');
    }
  }

  static async getStockSummary() {
    try {
      return await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { stock: 'asc' },
      });
    } catch (err) {
      throw new Error('Failed to fetch stock summary');
    }
  }
}

module.exports = InventoryService;
module.exports.MovementType = MovementType;
