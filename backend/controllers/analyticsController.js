import mongoose from 'mongoose'
import StudySession from '../models/analyticsModel.js'

// Helper: get date N days ago (start of day)
function startOfDayDaysAgo(days) {
	const d = new Date()
	d.setHours(0,0,0,0)
	d.setDate(d.getDate() - days)
	return d
}

// Record a study session. Expects { userId, topic, durationMinutes, occurredAt? }
export async function recordSession(req, res) {
	try {
		const { userId, topic, durationMinutes, occurredAt } = req.body
		if (!userId || !topic || !durationMinutes) {
			return res.status(400).json({ error: 'userId, topic and durationMinutes required' })
		}

		const session = new StudySession({
			userId: mongoose.Types.ObjectId(userId),
			topic,
			durationMinutes,
			occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
		})
		await session.save()
		return res.status(201).json({ ok: true, session })
	} catch (err) {
		console.error('recordSession error', err)
		return res.status(500).json({ error: 'server error' })
	}
}

// Get aggregated stats for a user in a timeframe. Query params: userId, range (7,30,365,all)
export async function getStats(req, res) {
	try {
		const userId = req.query.userId || (req.user && req.user._id)
		if (!userId) return res.status(400).json({ error: 'userId required' })

		const range = req.query.range || '7'
		let fromDate = null
		if (range !== 'all') {
			const days = parseInt(range, 10)
			if (!isNaN(days)) {
				fromDate = startOfDayDaysAgo(days - 1) // include today
			}
		}

		const match = { userId: mongoose.Types.ObjectId(userId) }
		if (fromDate) match.occurredAt = { $gte: fromDate }

		const sessions = await StudySession.find(match).lean()

		// Total hours
		const totalMinutes = sessions.reduce((s, it) => s + (it.durationMinutes || 0), 0)
		const totalHours = +(totalMinutes / 60).toFixed(2)

		// Topics finished (unique topics)
		const uniqueTopics = new Set(sessions.map(s => s.topic))
		const topicsFinished = uniqueTopics.size

		// Streak calculation: consecutive calendar days (with at least one session)
		const dateSet = new Set(sessions.map(s => {
			const d = new Date(s.occurredAt)
			d.setHours(0,0,0,0)
			return d.toISOString()
		}))

		// compute streak up to today
		let streak = 0
		const today = new Date(); today.setHours(0,0,0,0)
		let cursor = new Date(today)
		while (true) {
			const key = cursor.toISOString()
			if (dateSet.has(key)) {
				streak += 1
				cursor.setDate(cursor.getDate() - 1)
			} else break
		}

		// Line chart: daily minutes for requested range (default 7 days)
		const wantedDays = range === 'all' ? 365 : parseInt(range, 10) || 7
		const labels = []
		const values = []
		for (let i = wantedDays - 1; i >= 0; i--) {
			const d = startOfDayDaysAgo(i)
			const key = d.toISOString()
			labels.push(d.toISOString().slice(0,10))
			// sum sessions for that day
			const minutesForDay = sessions.filter(s => {
				const sd = new Date(s.occurredAt); sd.setHours(0,0,0,0)
				return sd.toISOString() === key
			}).reduce((a,b) => a + (b.durationMinutes||0), 0)
			values.push(minutesForDay)
		}

		// Donut: time per topic
		const topicMap = {}
		for (const s of sessions) {
			topicMap[s.topic] = (topicMap[s.topic] || 0) + (s.durationMinutes || 0)
		}
		const donut = Object.keys(topicMap).map(t => ({ topic: t, minutes: topicMap[t] }))

		return res.json({ totalHours, topicsFinished, streak, line: { labels, values }, donut })
	} catch (err) {
		console.error('getStats error', err)
		return res.status(500).json({ error: 'server error' })
	}
}

