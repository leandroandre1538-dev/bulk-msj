import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './db.js';

dotenv.config();

// Conectar a la base de datos
connectDB();

// Exportar la aplicación como un manejador de función serverless
export default (req, res) => {
    app(req, res);
};