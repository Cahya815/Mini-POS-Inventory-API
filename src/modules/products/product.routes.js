const { Router } = require('express');
const productController = require('./product.controller');
const roleMiddleware = require('../../common/middleware/roleMiddleware');

const router = Router();

// List all products with pagination (public read)
router.get('/', productController.getAllProducts);

// Get a product by ID (public read)
router.get('/:id', productController.getProductById);

// Get products by category ID (public read)
router.get('/category/:categoryId', productController.getProductsByCategory);

// Search products (public read)
router.get('/search', productController.searchProducts);

// Create a new product (ADMIN, MANAGER only)
router.post('/', roleMiddleware(['ADMIN', 'MANAGER']), productController.createProduct);

// Update product by ID (ADMIN, MANAGER only)
router.put('/:id', roleMiddleware(['ADMIN', 'MANAGER']), productController.updateProduct);

// Delete product by ID (ADMIN, MANAGER only)
router.delete('/:id', roleMiddleware(['ADMIN', 'MANAGER']), productController.deleteProduct);

module.exports = router;

