import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import taskRouters from "./routes/task.routes.js";
import templateRoutes from './routes/template.routes.js';
import credentialRoutes from './routes/credential.routes.js';
import contactRoutes from './routes/contact.routes.js'
import groupRoutes from './routes/group.routes.js';
import cors from "cors";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', taskRouters);
app.use('/api/templates', templateRoutes);
app.use('/api', credentialRoutes);
app.use('/api', contactRoutes);
app.use('/api', groupRoutes);

export default app;