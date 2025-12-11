import StudySession from '../models/StudySession.js'

export async function getSummary(req, res) {
	try {
		const { userId } = req.query
		if (!userId) return res.status(400).json({ error: 'userId required' })

		const sessions = await StudySession.aggregate([
			{ $match: { userId: new (await import('mongoose')).default.Types.ObjectId(userId) } },
			{ $group: {
				_id: null,
				totalSessions: { $sum: 1 },
				totalDuration: { $sum: '$durationSeconds' }
			} }
		])

		const byMode = await StudySession.aggregate([
			{ $match: { userId: new (await import('mongoose')).default.Types.ObjectId(userId) } },
			{ $group: { _id: '$mode', sessions: { $sum: 1 }, duration: { $sum: '$durationSeconds' } } },
			{ $project: { mode: '$_id', sessions: 1, duration: 1, _id: 0 } }
		])

		const summary = sessions[0] || { totalSessions: 0, totalDuration: 0 }
		res.json({
			totalSessions: summary.totalSessions,
			totalDurationSeconds: summary.totalDuration,
			byMode
		})
	} catch (err) {
		res.status(500).json({ error: 'Failed to compute summary', details: err.message })
	}
}

export async function getWeekly(req, res) {
	try {
		const { userId, weeks = 8 } = req.query
		if (!userId) return res.status(400).json({ error: 'userId required' })
		const mongoose = (await import('mongoose')).default
		const since = new Date()
		since.setDate(since.getDate() - Number(weeks) * 7)

		const data = await StudySession.aggregate([
			{ $match: { userId: new mongoose.Types.ObjectId(userId), startedAt: { $gte: since } } },
			{ $project: {
				week: { $isoWeek: '$startedAt' },
				year: { $isoWeekYear: '$startedAt' },
				durationSeconds: 1
			} },
			{ $group: { _id: { year: '$year', week: '$week' }, duration: { $sum: '$durationSeconds' }, sessions: { $sum: 1 } } },
			{ $sort: { '_id.year': 1, '_id.week': 1 } },
			{ $project: { label: { $concat: [ { $toString: '$_id.year' }, '-W', { $toString: '$_id.week' } ] }, duration: 1, sessions: 1, _id: 0 } }
		])

		res.json({ weeks: data })
	} catch (err) {
		res.status(500).json({ error: 'Failed to compute weekly', details: err.message })
	}
}
