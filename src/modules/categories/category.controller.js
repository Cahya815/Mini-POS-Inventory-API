const CategoryService = require('./category.service');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryService.getAllCategories();
    return res.json({ success: true, data: categories });
  } catch (err) {
    return next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(id);
    return res.json({ success: true, data: category });
  } catch (err) {
    return next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    return next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.updateCategory(id, req.body);
    return res.json({ success: true, data: category });
  } catch (err) {
    return next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
