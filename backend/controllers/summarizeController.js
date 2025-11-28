import Summarize from '../models/summarizeModel.js';

// Create and save a summary record
export async function createSummary(req, res) {
	try {
		const { sourceText, summaryText, title, fileName, userId, meta } = req.body;
		if (!sourceText || !summaryText) {
			return res.status(400).json({ error: 'sourceText and summaryText are required' });
		}

		const doc = await Summarize.create({
			userId: userId || null,
			sourceText,
			summaryText,
			title: title || '',
			fileName: fileName || '',
			meta: meta || {},
		});

		res.status(201).json({ id: doc._id, createdAt: doc.createdAt });
	} catch (err) {
		console.error('createSummary error:', err);
		res.status(500).json({ error: 'Failed to save summary', details: err.message });
	}
}

// Get summaries for a user (or all if no userId provided)
export async function getHistory(req, res) {
	try {
		const userId = req.query.userId || null;
		const filter = {};
		if (userId) filter.userId = userId;

		const items = await Summarize.find(filter).sort({ createdAt: -1 }).limit(100).lean();
		res.json({ items });
	} catch (err) {
		console.error('getHistory error:', err);
		res.status(500).json({ error: 'Failed to fetch history' });
	}
}

// Delete a summary by id
export async function deleteSummary(req, res) {
	try {
		const id = req.params.id;
		if (!id) return res.status(400).json({ error: 'id required' });

		await Summarize.findByIdAndDelete(id);
		res.json({ ok: true });
	} catch (err) {
		console.error('deleteSummary error:', err);
		res.status(500).json({ error: 'Failed to delete summary' });
	}
}

export default { createSummary, getHistory, deleteSummary };
