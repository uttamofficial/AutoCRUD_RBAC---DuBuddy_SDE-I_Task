import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import prisma from './prisma';
import authRouter from './routes/auth';
import modelRouter from './routes/modelRoutes';
import crudRouter from './routes/crud';

dotenv.config();

const app = express();

// CORS configuration - Allow frontend from environment variable
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
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

app.use('/auth', authRouter);
app.use('/api/models', modelRouter);
app.use('/api/crud', crudRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send('AutoCRUD-RBAC Backend is running');
});

// SPA fallback: for any GET request that isn't an API or auth route,
// return the frontend index.html so client-side routing can take over.
// SPA fallback: serve index.html for all other GET requests that
// were not handled by previous routes (API/auth/static). Placed
// after API routes so they take precedence.
app.get('/*', (req: Request, res: Response) => {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const indexHtml = path.join(frontendDistPath, 'index.html');

  // sendFile will handle 404/500 internally; add a simple callback to log if it fails
  res.sendFile(indexHtml, (err) => {
    if (err) {
      console.error('Error sending frontend index.html for', req.path, err);
      if (!res.headersSent) {
        const statusCode = (err as any).status || 500;
        res.status(statusCode).send((err as any).message || 'Error serving index.html');
      }
    }
  });
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
