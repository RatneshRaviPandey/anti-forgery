import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './db';

// Routes
import authRoutes from './routes/auth';
import usageRoutes from './routes/usage';
import detoxRoutes from './routes/detox';
import breathingRoutes from './routes/breathing';
import meditationRoutes from './routes/meditation';
import gamificationRoutes from './routes/gamification';
import communityRoutes from './routes/community';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: true, // Reflect request origin (allows any origin with credentials in dev)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/detox', detoxRoutes);
app.use('/api/breathing', breathingRoutes);
app.use('/api/meditation', meditationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/community', communityRoutes);

// Error handling
app.use(errorHandler);

// Initialize database and start server
async function start() {
  await initDatabase();
  app.listen(config.port, () => {
    console.log(`[Detoxify API] Running on port ${config.port} (${config.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('[Detoxify API] Failed to start:', err);
  process.exit(1);
});

export default app;
