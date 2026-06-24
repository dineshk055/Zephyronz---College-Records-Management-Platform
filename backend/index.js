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
import securityRoutes from "./routes/security.js";
import fs from "fs";

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Created uploads directory:", uploadsDir);
}

connectDB();

const myapp = express();

const allowedOrigins = [
  "https://zephyronz-college-records-managemen.vercel.app",
  "https://zephyronz-college-records-management.vercel.app",
  "https://zephyronz-college-records-management-platform-n00oro60l.vercel.app",
  "http://localhost:5173", // For local development
  "http://localhost:3000"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOriginFunction = (origin, callback) => {
  if (!origin) return callback(null, true);
  
  const isAllowed = allowedOrigins.includes(origin) || 
                    origin.endsWith(".vercel.app") || 
                    origin.startsWith("http://localhost:");
                    
  if (isAllowed) {
    callback(null, true);
  } else {
    console.log("CORS blocked origin:", origin);
    callback(new Error('Not allowed by CORS'));
  }
};

const httpServer = createServer(myapp);
const io = new Server(httpServer, {
  cors: {
    origin: corsOriginFunction,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }
});

// Configure CORS to allow frontend from Vercel and localhost
const corsOptions = {
  origin: corsOriginFunction,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

myapp.use(cors(corsOptions));
myapp.use(express.json());

// Attach io to req middleware
myapp.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.log("Socket authentication error:", err.message);
      next();
    }
  } else {
    next();
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  if (socket.user && socket.user.role === "admin") {
    socket.join("admin-room");
    console.log(`Admin socket joined admin-room: ${socket.id} (${socket.user.email})`);
  }

  socket.on("join-admin", () => {
    if (socket.user && socket.user.role === "admin") {
      socket.join("admin-room");
      console.log(`Admin socket joined admin-room manually: ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Serve static files from uploads directory with production fallback
myapp.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    // Only redirect to production if we are NOT already on the production server to avoid infinite redirect loops
    const host = req.headers.host || "";
    const isProductionHost = host.includes("onrender.com") || host.includes("zephyronz");
    
    if (!isProductionHost) {
      const productionUrl = `https://zephyronz-college-records-management.onrender.com/uploads${req.path}`;
      console.log(`Local file not found: ${req.path}. Redirecting to production: ${productionUrl}`);
      return res.redirect(productionUrl);
    }
    
    console.log(`File not found: ${req.path} (already on production, skipping redirect)`);
    res.status(404).json({ success: false, message: "File not found" });
  }
});

myapp.use("/api/auth", authRoutes);
myapp.use("/api/users", userRoutes);
myapp.use("/api/admin", adminRoutes);
myapp.use("/api/files", fileRoutes);
myapp.use("/api/security", securityRoutes);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server connected successfully http://localhost:${PORT}`);
});