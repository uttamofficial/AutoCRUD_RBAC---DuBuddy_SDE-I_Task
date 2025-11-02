import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/auth', authRouter);
app.use('/api/models', modelRouter);
app.use('/api/crud', crudRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send('AutoCRUD-RBAC Backend is running');
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
