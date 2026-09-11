const TransactionService = require('./transaction.service');

const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await TransactionService.getAllTransactions(page, limit);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await TransactionService.getTransactionById(id);
    return res.json({ success: true, data: transaction });
  } catch (err) {
    return next(err);
  }
};

const getTransactionsByCashier = async (req, res, next) => {
  try {
    const { cashierId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await TransactionService.getTransactionsByCashier(cashierId, page, limit);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const cashierId = req.user?.id;
    if (!cashierId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required' },
      });
    }

    const transaction = await TransactionService.createTransaction(req.body, cashierId);
    return res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  getTransactionsByCashier,
  createTransaction,
};
