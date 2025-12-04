import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
// Ensure directory exists
import fs from 'fs';
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, avatarsDir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname) || '';
		const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
		cb(null, name);
	}
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const router = express.Router();

// GET /api/profile/:userId
router.get('/:userId', getProfile);

// PUT /api/profile/:userId (multipart for image)
router.put('/:userId', upload.single('profileImage'), updateProfile);

export default router;
