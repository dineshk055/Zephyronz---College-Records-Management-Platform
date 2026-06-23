import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|pdf|mp4|webm|ogg|mkv|mov|avi|doc|docx|xls|xlsx|ppt|pptx|txt|csv/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  const isAllowedMimetype = 
    file.mimetype.startsWith("image/") || 
    file.mimetype.startsWith("video/") || 
    file.mimetype.startsWith("text/") || 
    /pdf|document|sheet|presentation|msword|excel|powerpoint|csv/.test(file.mimetype);

  if (extname && isAllowedMimetype) {
    return cb(null, true);
  } else {
    cb(new Error('File format not supported. Only images, PDFs, videos, and documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: fileFilter
});

export default upload;