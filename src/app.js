import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import taskRouters from "./routes/task.routes.js";
import templateRoutes from './routes/template.routes.js';
import credentialRoutes from './routes/credential.routes.js';
import contactRoutes from './routes/contact.routes.js';
import groupRoutes from './routes/group.routes.js';
import { connectDB } from "./db.js";

const app = express();

// Solo hace falta CORS si el frontend está en otro dominio (CORS_ORIGIN=https://a.com,https://b.com).
// En local el proxy de Vite y en Vercel el mismo dominio hacen que no sea necesario.
if (process.env.CORS_ORIGIN) {
    app.use(cors({
        origin: process.env.CORS_ORIGIN.split(',').map((o) => o.trim()),
        credentials: true
    }));
}

app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Asegura la conexión a MongoDB antes de atender cualquier ruta de la API.
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ message: "No se pudo conectar a la base de datos" });
    }
});

app.use('/api', authRoutes);
app.use('/api', taskRouters);
app.use('/api/templates', templateRoutes);
app.use('/api', credentialRoutes);
app.use('/api', contactRoutes);
app.use('/api', groupRoutes);

export default app;
