import mongoose from "mongoose";

// En serverless (Vercel) la misma instancia atiende varias peticiones:
// se reutiliza la conexión en lugar de abrir una nueva cada vez.
let connectionPromise = null;

export const connectDB = () => {
    if (mongoose.connection.readyState === 1) return Promise.resolve();

    if (!connectionPromise) {
        if (!process.env.MONGODB_URL) {
            return Promise.reject(new Error("Falta la variable de entorno MONGODB_URL"));
        }
        connectionPromise = mongoose
            .connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 10000 })
            .then(() => console.log(">>>> DB connected"))
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }
    return connectionPromise;
};
