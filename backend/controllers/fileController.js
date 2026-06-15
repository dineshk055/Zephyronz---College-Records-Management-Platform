import File from "../models/File.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pdfToPng } from 'pdf-to-png-converter';

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

    const filePath = req.file.path;
    const uniqueSuffix = req.file.filename.split('.')[0];
    const uploadDir = path.dirname(filePath);

    let pageFileNames = [];
    const isPDF = req.file.mimetype === "application/pdf" || req.file.originalname.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      try {
        const pngPages = await pdfToPng(filePath, {
          viewportScale: 2.0, // High quality scale
          outputFolder: uploadDir,
          outputFileMask: `${uniqueSuffix}-page`,
        });

        pageFileNames = pngPages.map(page => page.name);
        
        // Delete the original PDF file from the disk immediately since conversion succeeded
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (conversionError) {
        console.error("PDF to PNG conversion error, falling back to original PDF:", conversionError);
        // Fall back: do not delete the original PDF and keep pageFileNames empty.
        // The frontend will fall back to using the PDF fileUrl in the iframe.
      }
    } else {
      // If it's already an image or another document, store its file name directly in the pages array
      pageFileNames = [req.file.filename];
    }

    const newFile = await File.create({
      title: req.body.title,
      fileUrl: req.file.filename,
      pages: pageFileNames,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      msg: "File uploaded and processed successfully",
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

    // Delete physical page images from uploads folder
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (file.pages && file.pages.length > 0) {
      file.pages.forEach(pageFile => {
        const filePath = path.join(uploadDir, pageFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete physical original file from uploads folder if it exists and isn't deleted in pages loop
    if (file.fileUrl) {
      const originalFilePath = path.join(uploadDir, file.fileUrl);
      if (fs.existsSync(originalFilePath) && (!file.pages || !file.pages.includes(file.fileUrl))) {
        fs.unlinkSync(originalFilePath);
      }
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