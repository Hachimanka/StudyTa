import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { uploadTrack, listTracks, updateTrack, deleteTrack } from '../controllers/musicController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioStorageDir = path.join(__dirname, '..', 'uploads', 'music');
try { fs.mkdirSync(audioStorageDir, { recursive: true }); } catch (e) {}

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, audioStorageDir),
	filename: (req, file, cb) => {
		const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_/]/g,'_')}`;
		cb(null, safe);
	}
});

const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
	if (/^audio\//.test(file.mimetype)) cb(null, true); else cb(new Error('Only audio files allowed'));
}});

router.post('/upload', upload.single('track'), uploadTrack);
router.get('/', listTracks);
router.put('/:id', express.json(), updateTrack);
router.delete('/:id', deleteTrack);

export default router;
