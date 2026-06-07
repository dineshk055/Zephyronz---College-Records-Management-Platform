import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/adminRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const myapp = express();

// Configure CORS to allow frontend from Vercel and localhost
const corsOptions = {
  origin: [
    "https://zephyronz-college-records-managemen.vercel.app",
    "http://localhost:5173", // For local development
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

myapp.use(cors(corsOptions));
myapp.use(express.json());

// Serve static files from uploads directory
myapp.use('/uploads', express.static(path.join(__dirname, 'uploads')));

myapp.use("/api/auth", authRoutes);
myapp.use("/api/users", userRoutes);
myapp.use("/api/admin", adminRoutes);
myapp.use("/api/files", fileRoutes);

const PORT = process.env.PORT || 3000;

myapp.listen(PORT, () => {
  console.log(`Server connected successfully http://localhost:${PORT}`);
});