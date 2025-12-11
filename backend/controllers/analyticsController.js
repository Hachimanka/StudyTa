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

export async function recordSession(req, res) {
	try {
		const { userId, mode, durationMinutes, topic } = req.body
		if (!userId) return res.status(400).json({ error: 'userId required' })

		const durationSeconds = Math.round((durationMinutes || 0) * 60)
		// Default mode if not provided, but try to map from topic or use 'custom'
		const validModes = ['focus','pomodoro','flashcards','quiz','reading','custom', 'multipleChoice', 'trueFalse'];
		const finalMode = validModes.includes(mode) ? mode : 'custom';

		const session = new StudySession({
			userId,
			mode: finalMode,
			topic: topic || 'Untitled Session',
			startedAt: new Date(Date.now() - durationSeconds * 1000),
			endedAt: new Date(),
			durationSeconds
		})

		await session.save()
		res.status(201).json(session)
	} catch (err) {
		console.error('Record session failed', err)
		res.status(500).json({ error: 'Failed to record session', details: err.message })
	}
}

export async function getDaily(req, res) {
	try {
		const { userId, days = 7 } = req.query
		if (!userId) return res.status(400).json({ error: 'userId required' })
		const mongoose = (await import('mongoose')).default
		
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - Number(days) + 1); 
        start.setHours(0,0,0,0);

		const data = await StudySession.aggregate([
			{ $match: { 
                userId: new mongoose.Types.ObjectId(userId), 
                startedAt: { $gte: start } 
            } },
			{ $project: {
				date: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
				durationSeconds: 1
			} },
			{ $group: { _id: '$date', duration: { $sum: '$durationSeconds' }, sessions: { $sum: 1 } } },
			{ $sort: { '_id': 1 } }
		])
        
        // Fill gaps
        const result = [];
        // Clone start date to avoid modifying it in loop condition if not careful, though here it's fine
        const current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const found = data.find(item => item._id === dateStr);
            result.push({
                label: dateStr,
                duration: found ? found.duration : 0,
                sessions: found ? found.sessions : 0
            });
            current.setDate(current.getDate() + 1);
        }

		res.json({ days: result })
	} catch (err) {
		res.status(500).json({ error: 'Failed to compute daily', details: err.message })
	}
}
