import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './db.js';

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Exportar la aplicación Express como función serverless
export default (req, res) => {
  app(req, res);
};