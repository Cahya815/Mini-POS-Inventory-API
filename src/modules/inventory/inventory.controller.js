const InventoryService = require('./inventory.service');

const getAllMovements = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await InventoryService.getAllMovements(page, limit);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

const getMovementHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await InventoryService.getMovementHistory(productId, page, limit);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

const recordMovement = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required' },
      });
    }

    const movement = await InventoryService.recordMovement(req.body, userId);
    return res.status(201).json({ success: true, data: movement });
  } catch (err) {
    return next(err);
  }
};

const getProductStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await InventoryService.getProductStock(productId);
    return res.json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

const getStockSummary = async (req, res, next) => {
  try {
    const summary = await InventoryService.getStockSummary();
    return res.json({ success: true, data: summary });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllMovements,
  getMovementHistory,
  recordMovement,
  getProductStock,
  getStockSummary,
};
