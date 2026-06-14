import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import path from 'path';
import config from './config';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { initializeSocket } from './sockets';
import { ensureUploadDir } from './utils/storage';
import logger from './config/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();
const httpServer = http.createServer(app);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

ensureUploadDir();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/api-docs') && !req.path.startsWith('/socket.io') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  });
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ChartFlow API Docs',
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use(config.apiPrefix, apiLimiter, routes);
app.use(notFoundHandler);
app.use(errorHandler);

const io = initializeSocket(httpServer);

httpServer.listen(config.port, () => {
  logger.info(`
  ╔═══════════════════════════════════════════╗
  ║         ChartFlow Server Running          ║
  ║───────────────────────────────────────────║
  ║  Port:    ${config.port.toString().padEnd(30)}║
  ║  Mode:    ${config.nodeEnv.padEnd(30)}║
  ║  API:     http://localhost:${config.port}${config.apiPrefix}  ║
  ║  Docs:    http://localhost:${config.port}/api-docs     ║
  ╚═══════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
