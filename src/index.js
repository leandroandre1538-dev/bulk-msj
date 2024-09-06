import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './db.js';

dotenv.config();

const app = express();
connectDB();

app.use(express.json());

// Define tus rutas aquí
app.get('/', (req, res) => {
    res.send('Hello from Vercel!');
});

// Exportar el manejador de la función serverless
export default (req, res) => {
    return new Promise((resolve, reject) => {
        app(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};