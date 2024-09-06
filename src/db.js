import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(">>>> DB connected");
    } catch (error) {
        console.error("Database connection error:", error);
    }
};