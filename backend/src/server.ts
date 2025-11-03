import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import prisma from './prisma';
import authRouter from './routes/auth';
import modelRouter from './routes/modelRoutes';
import crudRouter from './routes/crud';
import homeRouter from './routes/home';

dotenv.config();

const app = express();

// CORS configuration - Allow frontend from environment variable
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://autocrud-rbac.onrender.com',
];

// Add production frontend URL if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// Serve frontend static files (Vite build) when available.
// The frontend `dist` directory is located at repository root `frontend/dist`.
// __dirname will be `backend/src` in dev (ts-node) or `backend/dist` in production
// (after `tsc`). Using ../../frontend/dist works for both run modes.
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/home', homeRouter);
app.use('/auth', authRouter);
app.use('/api/models', modelRouter);
app.use('/api/crud', crudRouter);

// SPA fallback: Catch-all route for frontend - MUST BE LAST!
// This serves index.html for all routes that aren't API/auth endpoints
// so React Router can handle client-side routing
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const port = Number(process.env.PORT || 4000);
app.listen(port, async () => {
  // warm up prisma
  try {
    await prisma.$connect();
    console.log('Prisma connected');
  } catch (err) {
    console.warn('Prisma connect failed', err);
  }
  console.log(`Server listening on port ${port}`);
});
