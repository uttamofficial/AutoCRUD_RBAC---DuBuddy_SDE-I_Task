"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("./prisma"));
const auth_1 = __importDefault(require("./routes/auth"));
const modelRoutes_1 = __importDefault(require("./routes/modelRoutes"));
const crud_1 = __importDefault(require("./routes/crud"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
app.use('/auth', auth_1.default);
app.use('/api/models', modelRoutes_1.default);
app.use('/api/crud', crud_1.default);
app.get('/', (_req, res) => {
    res.send('AutoCRUD-RBAC Backend is running');
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
