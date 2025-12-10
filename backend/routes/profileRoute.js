import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use memory storage so we can convert file to Base64 and store in MongoDB
const storage = multer.memoryStorage();

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// GET /api/profile/:userId
router.get('/:userId', getProfile);

// PUT /api/profile/:userId (multipart for image or JSON with Base64)
router.put('/:userId', upload.single('profileImage'), updateProfile);

export default router;
