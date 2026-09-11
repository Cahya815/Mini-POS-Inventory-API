const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StockFlow API',
      version: '1.0.0',
      description: 'REST API untuk Point of Sale (POS) dan Inventory Management System',
      contact: {
        name: 'Cahya815',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js', './src/app.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
