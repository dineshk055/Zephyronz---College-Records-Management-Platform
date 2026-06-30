import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import Folder from "../models/Folder.js";
import File from "../models/File.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// GET all folders - approved users
router.get("/", protect, async (req, res) => {
  try {
    const folders = await Folder.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      folders,
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

// POST create folder - admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Folder name is required",
      });
    }

    const folderName = name.trim();

    // Check if duplicate
    const existing = await Folder.findOne({ name: { $regex: new RegExp(`^${folderName}$`, "i") } });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: "Folder already exists",
      });
    }

    const newFolder = await Folder.create({
      name: folderName,
      createdBy: req.user._id,
    });

    if (req.io) {
      req.io.emit("folder-created", newFolder);
    }

    res.status(201).json({
      success: true,
      folder: newFolder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

// PUT rename folder - admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Folder name is required",
      });
    }

    const folderName = name.trim();

    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({
        success: false,
        msg: "Folder not found",
      });
    }

    const oldName = folder.name;

    // Check if new name already exists elsewhere
    if (oldName.toLowerCase() !== folderName.toLowerCase()) {
      const existing = await Folder.findOne({ name: { $regex: new RegExp(`^${folderName}$`, "i") } });
      if (existing) {
        return res.status(400).json({
          success: false,
          msg: "Folder with this name already exists",
        });
      }
    }

    folder.name = folderName;
    await folder.save();

    // Update all files using the old folder name
    await File.updateMany({ folder: oldName }, { folder: folderName });

    if (req.io) {
      req.io.emit("folder-renamed", {
        id: folder._id,
        oldName,
        newName: folderName,
      });
    }

    res.status(200).json({
      success: true,
      folder,
    });
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

// DELETE folder - admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({
        success: false,
        msg: "Folder not found",
      });
    }

    const folderName = folder.name;

    // Find and delete all files in this folder
    const files = await File.find({ folder: folderName });
    const uploadDir = path.join(__dirname, "..", "uploads");

    for (const file of files) {
      // Delete physical page images
      if (file.pages && file.pages.length > 0) {
        file.pages.forEach((pageFile) => {
          const filePath = path.join(uploadDir, pageFile);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      // Delete physical main file
      if (file.fileUrl) {
        const originalFilePath = path.join(uploadDir, file.fileUrl);
        if (fs.existsSync(originalFilePath) && (!file.pages || !file.pages.includes(file.fileUrl))) {
          fs.unlinkSync(originalFilePath);
        }
      }
      await file.deleteOne();
      
      // Emit file-deleted event for real-time file updates
      if (req.io) {
        req.io.emit("file-deleted", file._id.toString());
      }
    }

    await folder.deleteOne();

    if (req.io) {
      req.io.emit("folder-deleted", {
        id: folder._id,
        name: folderName,
      });
    }

    res.status(200).json({
      success: true,
      msg: "Folder and all its files deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

export default router;
