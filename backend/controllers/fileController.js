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
    let pageBase64Data = [];
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    const isPDF = req.file.mimetype === "application/pdf" || fileExtension === "pdf";
    const isImage = req.file.mimetype.startsWith("image/") || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExtension);
    const isVideo = req.file.mimetype.startsWith("video/") || ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(fileExtension);
    const isDoc = req.file.mimetype.startsWith("text/") || 
                  req.file.mimetype.includes("document") || 
                  req.file.mimetype.includes("sheet") || 
                  req.file.mimetype.includes("presentation") || 
                  req.file.mimetype.includes("msword") || 
                  req.file.mimetype.includes("excel") || 
                  req.file.mimetype.includes("powerpoint") || 
                  ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(fileExtension);

    if (isPDF) {
      try {
        const pngPages = await pdfToPng(filePath, {
          viewportScale: 2.0, // High quality scale
          outputFolder: uploadDir,
          outputFileMask: `${uniqueSuffix}-page`,
        });

        pageFileNames = pngPages.map(page => page.name);

        // Read each converted PNG, convert to base64, then delete from disk
        for (const page of pngPages) {
          const pagePath = page.path;
          if (fs.existsSync(pagePath)) {
            const data = fs.readFileSync(pagePath);
            const base64 = `data:image/png;base64,${data.toString('base64')}`;
            pageBase64Data.push(base64);
            fs.unlinkSync(pagePath); // Clean up converted PNG page immediately
          }
        }
        
        // Delete the original PDF file from the disk immediately
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (conversionError) {
        console.error("PDF to PNG conversion error:", conversionError);
        // Clean up original PDF if it exists
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(500).json({
          success: false,
          msg: "Failed to process PDF pages into images: " + conversionError.message,
        });
      }
    } else if (isImage) {
      // If it's already an image, read, encode to base64, then delete original
      pageFileNames = [req.file.filename];
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        const base64 = `data:${req.file.mimetype};base64,${data.toString('base64')}`;
        pageBase64Data = [base64];
        fs.unlinkSync(filePath); // Clean up uploaded image immediately
      }
    } else if (isVideo || isDoc) {
      // Keep video or document files on disk! Do not delete them.
      // They will be served statically from the uploads folder.
      pageFileNames = [];
      pageBase64Data = [];
    } else {
      // Clean up file if not supported
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        msg: "Unsupported file format. Allowed formats: PDFs, images, videos, and office documents.",
      });
    }

    const newFile = await File.create({
      title: req.body.title,
      fileUrl: req.file.filename,
      pages: pageFileNames,
      pagesData: pageBase64Data,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    const populatedFile = await File.findById(newFile._id).populate("uploadedBy", "name email");

    if (req.io) {
      req.io.emit("file-uploaded", populatedFile);
      console.log(`Socket broadcast: new file "${populatedFile.title}" uploaded.`);
    }

    res.status(201).json({
      success: true,
      msg: "File uploaded successfully!",
      file: populatedFile,
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

// get single file by ID
export const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate("uploadedBy", "name email");
    if (!file) {
      return res.status(404).json({
        success: false,
        msg: "File not found",
      });
    }
    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    console.error("Error fetching single file:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};