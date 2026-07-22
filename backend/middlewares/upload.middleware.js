const multer = require('multer');

// Store files in memory so we can upload them directly to Supabase Storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDFs and Images based on client form specs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
  }
});

module.exports = upload;
