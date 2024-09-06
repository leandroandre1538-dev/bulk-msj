import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './db.js';

dotenv.config();

connectDB();
const port = process.env.PORT || 3030;
app.listen(port, () => {
    console.log(`Server on port ${port}`);
});
