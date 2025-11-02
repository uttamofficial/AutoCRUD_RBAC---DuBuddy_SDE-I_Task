"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("./prisma"));
const auth_1 = __importDefault(require("./routes/auth"));
const modelRoutes_1 = __importDefault(require("./routes/modelRoutes"));
const crud_1 = __importDefault(require("./routes/crud"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration - Allow frontend from environment variable
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
];
// Add production frontend URL if set
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Serve frontend static files (Vite build) when available.
// The frontend `dist` directory is located at repository root `frontend/dist`.
// __dirname will be `backend/src` in dev (ts-node) or `backend/dist` in production
// (after `tsc`). Using ../../frontend/dist works for both run modes.
const frontendDistPath = path_1.default.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express_1.default.static(frontendDistPath));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
app.use('/auth', auth_1.default);
app.use('/api/models', modelRoutes_1.default);
app.use('/api/crud', crud_1.default);
app.get('/', (_req, res) => {
    res.send('AutoCRUD-RBAC Backend is running');
});
// SPA fallback: for any GET request that isn't an API or auth route,
// return the frontend index.html so client-side routing can take over.
// SPA fallback: serve index.html for all other GET requests that
// were not handled by previous routes (API/auth/static). Placed
// after API routes so they take precedence.
app.get('/*', (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).send('Method not allowed');
    }
    const indexHtml = path_1.default.join(frontendDistPath, 'index.html');
    // sendFile will handle 404/500 internally; add a simple callback to log if it fails
    res.sendFile(indexHtml, (err) => {
        if (err) {
            console.error('Error sending frontend index.html for', req.path, err);
            if (!res.headersSent) {
                const statusCode = err.status || 500;
                res.status(statusCode).send(err.message || 'Error serving index.html');
            }
        }
    });
});
const port = Number(process.env.PORT || 4000);
app.listen(port, async () => {
    // warm up prisma
    try {
        await prisma_1.default.$connect();
        console.log('Prisma connected');
    }
    catch (err) {
        console.warn('Prisma connect failed', err);
    }
    console.log(`Server listening on port ${port}`);
});
