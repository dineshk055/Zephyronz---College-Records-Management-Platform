import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import {
  uploadFile,
  getAllFiles,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();

// upload file - admin only
router.post(
  "/upload",

  protect,

  adminOnly,

  upload.single("file"),

  uploadFile
);

// get all files - approved users
router.get(
  "/",

  protect,

  getAllFiles
);

// delete file - admin only
router.delete(
  "/:id",

  protect,

  adminOnly,

  deleteFile
);

export default router;

// http://localhost:3000/api/files/upload