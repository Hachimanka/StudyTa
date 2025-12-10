import express from 'express';
import multer from 'multer';
import { getProfile, updateProfile } from '../controllers/profileController.js';

// Use memory storage - images will be stored as Base64 in MongoDB, not on disk
const storage = multer.memoryStorage();

const upload = multer({ 
	storage, 
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	fileFilter: (req, file, cb) => {
		// Only allow image files
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

// PUT /api/profile/:userId (multipart for image)
router.put('/:userId', upload.single('profileImage'), updateProfile);

export default router;
