const { Router } = require('express');
const inventoryController = require('./inventory.controller');
const roleMiddleware = require('../../common/middleware/roleMiddleware');

const router = Router();

// Get all inventory movements with pagination (ADMIN, MANAGER only)
router.get('/movements', roleMiddleware(['ADMIN', 'MANAGER']), inventoryController.getAllMovements);

// Get movement history for a specific product (ADMIN, MANAGER only)
router.get('/products/:productId/history', roleMiddleware(['ADMIN', 'MANAGER']), inventoryController.getMovementHistory);

// Record a stock movement (ADMIN, MANAGER only)
router.post('/movements', roleMiddleware(['ADMIN', 'MANAGER']), inventoryController.recordMovement);

// Get current stock for a product (ADMIN, MANAGER, CASHIER)
router.get('/products/:productId/stock', roleMiddleware(['ADMIN', 'MANAGER', 'CASHIER']), inventoryController.getProductStock);

// Get stock summary for all products (ADMIN, MANAGER only)
router.get('/summary', roleMiddleware(['ADMIN', 'MANAGER']), inventoryController.getStockSummary);

module.exports = router;

