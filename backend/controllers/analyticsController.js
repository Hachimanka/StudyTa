import mongoose from 'mongoose'
import StudySession from '../models/analyticsModel.js'

// Helper: get date N days ago (start of day)
function startOfDayDaysAgo(days) {
	const d = new Date()
	d.setHours(0,0,0,0)
	d.setDate(d.getDate() - days)
	return d
}

// Helper: get start of current week (Monday at 00:00:00)
function getStartOfWeek() {
	const d = new Date()
	d.setHours(0, 0, 0, 0)
	const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
	const diff = day === 0 ? 6 : day - 1 // If Sunday, go back 6 days; otherwise go back (day-1) days
	d.setDate(d.getDate() - diff)
	return d
}

// Record a study session. Expects { userId, topic, durationMinutes, occurredAt? }
export async function recordSession(req, res) {
	try {
		const { userId, topic, durationMinutes, occurredAt } = req.body
		if (!userId || !topic || durationMinutes === undefined) {
			return res.status(400).json({ error: 'userId, topic and durationMinutes required' })
		}

		// Validate and convert userId to ObjectId
		let userObjectId
		try {
			userObjectId = new mongoose.Types.ObjectId(userId)
		} catch (e) {
			return res.status(400).json({ error: 'Invalid userId format' })
		}

		const session = new StudySession({
			userId: userObjectId,
			topic,
			durationMinutes: Math.max(0, Number(durationMinutes) || 0),
			occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
		})
		await session.save()
		return res.status(201).json({ ok: true, session })
	} catch (err) {
		console.error('recordSession error', err)
		return res.status(500).json({ error: 'server error', details: err.message })
	}
}

// Get aggregated stats for a user in a timeframe. Query params: userId, range (7,30,365,all,week)
export async function getStats(req, res) {
	try {
		const userId = req.query.userId || (req.user && req.user._id)
		if (!userId) return res.status(400).json({ error: 'userId required' })

		const range = req.query.range || '7'
		let fromDate = null
		let isWeekRange = false
		
		if (range === 'week') {
			// Current week starting from Monday
			fromDate = getStartOfWeek()
			isWeekRange = true
		} else if (range !== 'all') {
			const days = parseInt(range, 10)
			if (!isNaN(days)) {
				fromDate = startOfDayDaysAgo(days - 1) // include today
			}
		}

		// Validate and convert userId to ObjectId
		let userObjectId
		try {
			userObjectId = new mongoose.Types.ObjectId(userId)
		} catch (e) {
			return res.status(400).json({ error: 'Invalid userId format' })
		}

		const match = { userId: userObjectId }
		if (fromDate) match.occurredAt = { $gte: fromDate }

		const sessions = await StudySession.find(match).lean()

		// Get ALL sessions for streak calculation (ignore date filter)
		const allSessions = await StudySession.find({ userId: userObjectId }).lean()

		// Streak calculation: consecutive calendar days (with at least one session)
		const allDateSet = new Set(allSessions.map(s => {
			const d = new Date(s.occurredAt)
			d.setHours(0,0,0,0)
			return d.toISOString()
		}))

		// Compute streak up to today and find streak start date
		let streak = 0
		const today = new Date(); today.setHours(0,0,0,0)
		let cursor = new Date(today)
		let streakStartDate = null
		
		while (true) {
			const key = cursor.toISOString()
			if (allDateSet.has(key)) {
				streak += 1
				streakStartDate = new Date(cursor) // Keep track of earliest streak day
				cursor.setDate(cursor.getDate() - 1)
			} else break
		}

		// Total hours: only count sessions since streak started (resets when streak = 0)
		let totalMinutes = 0
		if (streak > 0 && streakStartDate) {
			// Sum all sessions from streak start date onwards
			totalMinutes = allSessions
				.filter(s => {
					const sd = new Date(s.occurredAt)
					sd.setHours(0, 0, 0, 0)
					return sd >= streakStartDate
				})
				.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
		}
		const totalHours = +(totalMinutes / 60).toFixed(2)

		// Topics finished (unique topics from current streak period only)
		const streakSessions = streak > 0 && streakStartDate 
			? allSessions.filter(s => {
				const sd = new Date(s.occurredAt)
				sd.setHours(0, 0, 0, 0)
				return sd >= streakStartDate
			})
			: []
		const uniqueTopics = new Set(streakSessions.map(s => s.topic))
		const topicsFinished = uniqueTopics.size

		// Line chart: daily minutes for requested range
		let labels = []
		let values = []
		
		if (isWeekRange) {
			// For week range: always show Mon-Sun of current week
			const weekStart = getStartOfWeek()
			for (let i = 0; i < 7; i++) {
				const d = new Date(weekStart)
				d.setDate(weekStart.getDate() + i)
				const key = d.toISOString()
				labels.push(d.toISOString().slice(0, 10))
				// sum sessions for that day, capped at 24 hours (1440 minutes)
				const minutesForDay = sessions.filter(s => {
					const sd = new Date(s.occurredAt)
					sd.setHours(0, 0, 0, 0)
					return sd.toISOString() === key
				}).reduce((a, b) => a + (b.durationMinutes || 0), 0)
				values.push(Math.min(minutesForDay, 1440)) // Cap at 24 hours
			}
		} else {
			// For other ranges: show last N days
			const wantedDays = range === 'all' ? 365 : parseInt(range, 10) || 7
			for (let i = wantedDays - 1; i >= 0; i--) {
				const d = startOfDayDaysAgo(i)
				const key = d.toISOString()
				labels.push(d.toISOString().slice(0, 10))
				// sum sessions for that day, capped at 24 hours (1440 minutes)
				const minutesForDay = sessions.filter(s => {
					const sd = new Date(s.occurredAt)
					sd.setHours(0, 0, 0, 0)
					return sd.toISOString() === key
				}).reduce((a, b) => a + (b.durationMinutes || 0), 0)
				values.push(Math.min(minutesForDay, 1440)) // Cap at 24 hours
			}
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

