const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { authMiddleware } = require('./common/middleware/authMiddleware');

// Swagger - optional (gracefully skip if not installed)
let swaggerUi;
let specs;
try {
  const swaggerConfig = require('./config/swagger');
  swaggerUi = swaggerConfig.swaggerUi;
  specs = swaggerConfig.specs;
} catch (err) {
  // swagger-jsdoc or swagger-ui-express not installed yet
  console.warn('⚠️  Swagger UI not available - install with: npm install swagger-jsdoc swagger-ui-express');
}

const authRouter = require('./modules/auth/auth.routes');
const userRouter = require('./modules/users/user.routes');
const productRouter = require('./modules/products/product.routes');
const categoryRouter = require('./modules/categories/category.routes');
const inventoryRouter = require('./modules/inventory/inventory.routes');
const transactionRouter = require('./modules/transactions/transaction.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware (optional — runs on all requests)
app.use(authMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation (if Swagger installed)
if (swaggerUi && specs) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/transactions', transactionRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Resource not found' },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
});

module.exports = app;
