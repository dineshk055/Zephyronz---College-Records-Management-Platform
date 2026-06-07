import File from "../models/File.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// upload file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: "No file uploaded",
      });
    }

    // Store just the filename, not the full path
    const fileUrl = req.file.filename;

    const newFile = await File.create({
      title: req.body.title,
      fileUrl: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      msg: "File uploaded successfully",
      file: newFile,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      msg: error.message || "Server error",
    });
  }
};

// get all files
export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      files: files,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

// delete file
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        msg: "File not found",
      });
    }

    // Delete physical file from uploads folder
    const filePath = path.join(__dirname, '..', 'uploads', file.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }

    await file.deleteOne();

    res.status(200).json({
      success: true,
      msg: "File deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};