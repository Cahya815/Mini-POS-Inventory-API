const { z } = require('zod');
const prisma = require('../../config/database');
const { ValidationError, NotFoundError } = require('../../common/errors/AppError');

const transactionSelect = {
  id: true,
  cashierId: true,
  totalAmount: true,
  createdAt: true,
  cashier: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPrice: true,
      subtotal: true,
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
  },
};

const transactionItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

const createTransactionSchema = z.object({
  items: z.array(transactionItemSchema).min(1, 'At least one item is required'),
});

class TransactionService {
  static async getAllTransactions(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          select: transactionSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.transaction.count(),
      ]);

      return {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      throw new Error('Failed to fetch transactions');
    }
  }

  static async getTransactionById(id) {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid transaction ID');
    }

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        select: transactionSelect,
      });

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      return transaction;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new Error('Failed to fetch transaction');
    }
  }

  static async getTransactionsByCashier(cashierId, page = 1, limit = 20) {
    if (!cashierId || typeof cashierId !== 'string') {
      throw new ValidationError('Invalid cashier ID');
    }

    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: { cashierId },
          select: transactionSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.transaction.count({ where: { cashierId } }),
      ]);

      return {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      throw new Error('Failed to fetch transactions by cashier');
    }
  }

  static async createTransaction(data, cashierId) {
    if (!cashierId || typeof cashierId !== 'string') {
      throw new ValidationError('Cashier ID is required');
    }

    try {
      const validated = createTransactionSchema.parse(data);

      const transaction = await prisma.$transaction(async (tx) => {
        const transactionItems = [];
        let totalAmount = 0;

        for (const item of validated.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundError(`Product not found: ${item.productId}`);
          }

          if (product.stock < item.quantity) {
            throw new ValidationError(
              `Insufficient stock for ${product.name} (SKU: ${product.sku}). Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }

          const unitPrice = product.price;
          const subtotal = unitPrice * item.quantity;
          totalAmount += subtotal;

          transactionItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            subtotal,
          });

          const previousStock = product.stock;
          const newStock = previousStock - item.quantity;

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: 'SALE',
              quantity: -item.quantity,
              previousStock,
              newStock,
              createdBy: cashierId,
            },
          });
        }

        const createdTransaction = await tx.transaction.create({
          data: {
            cashierId,
            totalAmount,
            items: {
              create: transactionItems,
            },
          },
          select: transactionSelect,
        });

        return createdTransaction;
      });

      return transaction;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.issues?.[0]?.message || 'Validation failed';
        throw new ValidationError(`Validation failed: ${msg}`);
      }
      if (err instanceof ValidationError || err instanceof NotFoundError) throw err;
      throw new Error('Failed to create transaction');
    }
  }
}

module.exports = TransactionService;
