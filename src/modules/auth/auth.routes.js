const { Router } = require('express');
const { login, register } = require('./auth.controller');

const router = Router();

router.post('/login', login);
router.post('/register', register);

module.exports = router;
