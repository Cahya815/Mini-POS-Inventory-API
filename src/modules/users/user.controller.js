const UserService = require('./user.service');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    return res.json({ success: true, data: users });
  } catch (err) {
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await UserService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Role is required' },
      });
    }
    const updatedUser = await UserService.updateUserRole(id, role);
    return res.json({ success: true, data: updatedUser });
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deletedUser = await UserService.deleteUser(id);
    return res.json({ success: true, data: deletedUser });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
