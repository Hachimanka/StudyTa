import Music from '../models/musicModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload handler: multer will have stored file on disk and put file info on req.file
export const uploadTrack = async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		const uploadsRel = path.join('uploads', 'music');
		const filename = req.file.filename;
		const publicUrl = `${req.protocol}://${req.get('host')}/${uploadsRel}/${filename}`;

		const owner = req.body && req.body.user_id ? req.body.user_id : null;
		const doc = await Music.create({
			name: req.file.originalname,
			filename,
			url: publicUrl,
			size: req.file.size,
			owner: owner || null,
		});

		res.json(doc);
	} catch (err) {
		console.error('uploadTrack error:', err);
		res.status(500).json({ error: 'Upload failed', details: err.message });
	}
};

export const listTracks = async (req, res) => {
	try {
		const owner = req.query.owner || req.query.user_id || null;
		const includeNull = String(req.query.includeNull || '').toLowerCase() === 'true';
		let criteria = {};
		if (owner) {
			criteria = includeNull ? { $or: [{ owner }, { owner: null }] } : { owner };
		}
		const docs = await Music.find(criteria).sort({ uploadedAt: -1 }).limit(200).lean();
		res.json(docs);
	} catch (err) {
		console.error('listTracks error:', err);
		res.status(500).json({ error: 'Failed to list tracks' });
	}
};

export const updateTrack = async (req, res) => {
	try {
		const id = req.params.id;
		const { durationSeconds, duration } = req.body;
		const update = {};
		if (typeof durationSeconds !== 'undefined') update.durationSeconds = Number(durationSeconds) || null;
		if (typeof duration !== 'undefined') update.duration = String(duration);

		const doc = await Music.findByIdAndUpdate(id, update, { new: true });
		if (!doc) return res.status(404).json({ error: 'Not found' });
		res.json(doc);
	} catch (err) {
		console.error('updateTrack error:', err);
		res.status(500).json({ error: 'Failed to update track' });
	}
};

export const deleteTrack = async (req, res) => {
	try {
		const id = req.params.id;
		console.log('deleteTrack requested for id:', id);

		// Try to find by ObjectId first
		let doc = null;
		try {
			if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
				doc = await Music.findById(id);
			}
		} catch (e) {
			console.warn('findById threw', e.message);
		}

		// Fallback: try to find by filename or by stored id field
		if (!doc) {
			doc = await Music.findOne({ $or: [{ filename: id }, { _id: id }, { name: id }] });
		}

		if (!doc) {
			console.warn('deleteTrack: no document matched for id:', id);
			return res.status(404).json({ error: 'Track not found' });
		}

		// delete file from disk if exists
		try {
			const filePath = path.join(__dirname, '..', 'uploads', 'music', doc.filename);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (e) {
			console.warn('Failed to remove file from disk', e.message);
		}

		await doc.remove();
		console.log('deleteTrack: removed document', doc._id?.toString());
		res.json({ success: true });
	} catch (err) {
		console.error('deleteTrack error:', err);
		res.status(500).json({ error: 'Failed to delete track' });
	}
};
