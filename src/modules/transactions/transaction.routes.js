const { Router } = require('express');
const transactionController = require('./transaction.controller');
const roleMiddleware = require('../../common/middleware/roleMiddleware');

const router = Router();

// Get all transactions with pagination (ADMIN, MANAGER only)
router.get('/', roleMiddleware(['ADMIN', 'MANAGER']), transactionController.getAllTransactions);

// Get a transaction by ID (ADMIN, MANAGER, CASHIER)
router.get('/:id', roleMiddleware(['ADMIN', 'MANAGER', 'CASHIER']), transactionController.getTransactionById);

// Get transactions by cashier ID (ADMIN, MANAGER only)
router.get('/cashier/:cashierId', roleMiddleware(['ADMIN', 'MANAGER']), transactionController.getTransactionsByCashier);

// Create a new transaction (CASHIER, MANAGER, ADMIN can initiate)
router.post('/', roleMiddleware(['ADMIN', 'MANAGER', 'CASHIER']), transactionController.createTransaction);

module.exports = router;

