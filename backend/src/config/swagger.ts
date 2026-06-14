import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChartFlow API',
      version: '1.0.0',
      description: 'ChartFlow - Collaboration & Communication Platform API',
      contact: {
        name: 'ChartFlow Support',
        email: 'support@chartflow.com',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development' },
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
  apis: ['./src/routes/*.ts'],
};

export default swaggerJsdoc(options);
