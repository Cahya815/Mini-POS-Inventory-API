const { Router } = require('express');
const categoryController = require('./category.controller');
const roleMiddleware = require('../../common/middleware/roleMiddleware');

const router = Router();

// List all categories (no auth required for read)
router.get('/', categoryController.getAllCategories);

// Get a category by ID (no auth required for read)
router.get('/:id', categoryController.getCategoryById);

// Create a new category (ADMIN, MANAGER only)
router.post('/', roleMiddleware(['ADMIN', 'MANAGER']), categoryController.createCategory);

// Update category by ID (ADMIN, MANAGER only)
router.put('/:id', roleMiddleware(['ADMIN', 'MANAGER']), categoryController.updateCategory);

// Delete category by ID (ADMIN, MANAGER only)
router.delete('/:id', roleMiddleware(['ADMIN', 'MANAGER']), categoryController.deleteCategory);

module.exports = router;

