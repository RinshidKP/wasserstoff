import multer from 'multer';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the destination directory where uploaded images will be stored
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded image
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

// Multer middleware configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Maximum file size (10 MB)
  }
});

export default upload;
