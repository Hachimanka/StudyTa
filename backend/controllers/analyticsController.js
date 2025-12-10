import StudySession from '../models/StudySession.js'
import UserAnalytics from '../models/UserAnalytics.js'
import Quiz from '../models/Quiz.js'
import mongoose from 'mongoose'

export async function getSummary(req, res) {
	try {
		const { userId } = req.query
		if (!userId) return res.status(400).json({ error: 'userId required' })

		const sessions = await StudySession.aggregate([
			{ $match: { userId: new mongoose.Types.ObjectId(userId) } },
			{ $group: {
				_id: null,
				totalSessions: { $sum: 1 },
				totalDuration: { $sum: '$durationSeconds' }
			} }
		])

		const byMode = await StudySession.aggregate([
			{ $match: { userId: new mongoose.Types.ObjectId(userId) } },
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

// Get comprehensive stats for analytics page and dashboard
export async function getStats(req, res) {
	try {
		const { userId } = req.query
		if (!userId) return res.status(400).json({ error: 'userId required' })

		// Get or create user analytics record
		let userAnalytics = await UserAnalytics.findOne({ userId: new mongoose.Types.ObjectId(userId) })
		if (!userAnalytics) {
			userAnalytics = await UserAnalytics.create({
				userId: new mongoose.Types.ObjectId(userId),
				streak: 0,
				lastStudyDate: null,
				topicsCompleted: []
			})
		}

		// Calculate total hours from study sessions
		const sessions = await StudySession.aggregate([
			{ $match: { userId: new mongoose.Types.ObjectId(userId) } },
			{ $group: {
				_id: null,
				totalDuration: { $sum: '$durationSeconds' }
			} }
		])
		const totalSeconds = sessions[0]?.totalDuration || 0
		const totalHours = Math.round((totalSeconds / 3600) * 10) / 10 // 1 decimal place

		// Count unique topics finished (from completed quizzes)
		const topicsFinished = await Quiz.distinct('title', { userId: userId.toString() })

		res.json({
			totalHours,
			topicsFinished: topicsFinished.length,
			streak: userAnalytics.streak,
			lastStudyDate: userAnalytics.lastStudyDate
		})
	} catch (err) {
		console.error('getStats error:', err)
		res.status(500).json({ error: 'Failed to get stats', details: err.message })
	}
}

// Record a study session and update streak
export async function recordSession(req, res) {
	try {
		const { userId, topic, durationMinutes, mode = 'custom' } = req.body
		if (!userId) return res.status(400).json({ error: 'userId required' })

		const now = new Date()
		const today = now.toDateString()

		// Create study session
		const durationSeconds = Math.max(0, Math.floor((durationMinutes || 0) * 60))
		await StudySession.create({
			userId: new mongoose.Types.ObjectId(userId),
			mode: mode || 'custom',
			startedAt: now,
			endedAt: now,
			durationSeconds
		})

		// Update user analytics (streak logic)
		let userAnalytics = await UserAnalytics.findOne({ userId: new mongoose.Types.ObjectId(userId) })
		if (!userAnalytics) {
			userAnalytics = await UserAnalytics.create({
				userId: new mongoose.Types.ObjectId(userId),
				streak: 1,
				lastStudyDate: now,
				topicsCompleted: topic ? [topic] : []
			})
		} else {
			const lastDate = userAnalytics.lastStudyDate
			const lastDateStr = lastDate ? lastDate.toDateString() : null

			// Check if already studied today
			if (lastDateStr !== today) {
				// Check if studied yesterday (continue streak) or missed a day (reset streak)
				const yesterday = new Date(now)
				yesterday.setDate(yesterday.getDate() - 1)
				const yesterdayStr = yesterday.toDateString()

				if (lastDateStr === yesterdayStr) {
					// Studied yesterday, continue streak
					userAnalytics.streak += 1
				} else {
					// Missed a day or first time, start new streak
					userAnalytics.streak = 1
				}
				userAnalytics.lastStudyDate = now
			}

			// Track topic if provided
			if (topic && !userAnalytics.topicsCompleted.includes(topic)) {
				userAnalytics.topicsCompleted.push(topic)
			}

			await userAnalytics.save()
		}

		res.json({ 
			ok: true, 
			streak: userAnalytics.streak,
			lastStudyDate: userAnalytics.lastStudyDate
		})
	} catch (err) {
		console.error('recordSession error:', err)
		res.status(500).json({ error: 'Failed to record session', details: err.message })
	}
}

// Record topic completion (called when user finishes a study set)
export async function recordTopicCompletion(req, res) {
	try {
		const { userId, topic } = req.body
		if (!userId || !topic) return res.status(400).json({ error: 'userId and topic required' })

		let userAnalytics = await UserAnalytics.findOne({ userId: new mongoose.Types.ObjectId(userId) })
		if (!userAnalytics) {
			userAnalytics = await UserAnalytics.create({
				userId: new mongoose.Types.ObjectId(userId),
				streak: 0,
				lastStudyDate: null,
				topicsCompleted: [topic]
			})
		} else {
			if (!userAnalytics.topicsCompleted.includes(topic)) {
				userAnalytics.topicsCompleted.push(topic)
				await userAnalytics.save()
			}
		}

		res.json({ ok: true, topicsCompleted: userAnalytics.topicsCompleted.length })
	} catch (err) {
		console.error('recordTopicCompletion error:', err)
		res.status(500).json({ error: 'Failed to record topic completion', details: err.message })
	}
}

export async function getWeekly(req, res) {
	try {
		const { userId, weeks = 8 } = req.query
		if (!userId) return res.status(400).json({ error: 'userId required' })
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

// Get daily breakdown for chart (last N days)
export async function getDaily(req, res) {
	try {
		const { userId, days = 7 } = req.query
		if (!userId) return res.status(400).json({ error: 'userId required' })

		// Calculate start of the current week (Monday)
		const today = new Date()
		const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
		const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Sunday is end of week
		
		const startOfWeek = new Date(today)
		startOfWeek.setDate(today.getDate() - daysFromMonday)
		startOfWeek.setHours(0, 0, 0, 0)

		const data = await StudySession.aggregate([
			{ $match: { userId: new mongoose.Types.ObjectId(userId), startedAt: { $gte: startOfWeek } } },
			{ $project: {
				date: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
				durationSeconds: 1
			} },
			{ $group: { _id: '$date', duration: { $sum: '$durationSeconds' }, sessions: { $sum: 1 } } },
			{ $sort: { '_id': 1 } },
			{ $project: { date: '$_id', duration: 1, sessions: 1, _id: 0 } }
		])

		// Fill in all days from Monday to Sunday
		const result = []
		const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		for (let i = 0; i < 7; i++) {
			const d = new Date(startOfWeek)
			d.setDate(startOfWeek.getDate() + i)
			const dateStr = d.toISOString().split('T')[0]
			const found = data.find(x => x.date === dateStr)
			result.push({
				date: dateStr,
				label: weekdayLabels[i],
				duration: found?.duration || 0,
				sessions: found?.sessions || 0
			})
		}

		res.json({ days: result })
	} catch (err) {
		res.status(500).json({ error: 'Failed to compute daily', details: err.message })
	}
}
