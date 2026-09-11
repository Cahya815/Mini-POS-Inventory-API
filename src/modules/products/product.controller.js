// product.controller.js - handles HTTP requests for Product resources
// Called by product.routes.js which registers routes under '/api/v1/products'
// No direct file read/write; interacts with ProductService for DB operations

const ProductService = require('./product.service');

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await ProductService.getAllProducts(page, limit);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    return res.json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await ProductService.getProductsByCategoryId(categoryId, page, limit);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await ProductService.searchProducts(query, page, limit);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.createProduct(req.body);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    return res.json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ProductService.deleteProduct(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
