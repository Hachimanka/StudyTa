import StudySession from '../models/StudySession.js'
import Users from '../models/Users.js'
import mongoose from 'mongoose'

export async function updateStudyStreak(userId, date) {
	try {
		if (!userId) return
		const d = date ? new Date(date) : new Date()
		d.setHours(0,0,0,0)
		const user = await Users.findById(userId)
		if (!user) return
		if (user.lastStudyDate) {
			const last = new Date(user.lastStudyDate)
			last.setHours(0,0,0,0)
			const diffDays = Math.round((d - last) / (24 * 60 * 60 * 1000))
			if (diffDays === 0) return
			if (diffDays === 1) user.studyStreak = (user.studyStreak || 0) + 1
			else user.studyStreak = 1
		} else {
			user.studyStreak = 1
		}
		user.lastStudyDate = d
		await user.save()
	} catch (err) {
		// don't fail session flows for streak update issues
		console.warn('Failed to update study streak', err.message)
	}
}

export async function startSession(req, res) {
	try {
		const { userId, mode, startedAt } = req.body
		if (!userId || !mode) return res.status(400).json({ error: 'userId and mode required' })
		const now = new Date()
		const windowMs = 2 * 60 * 1000 // consider duplicate if within 2 minutes
		const recent = new Date(now.getTime() - windowMs)
		const existing = await StudySession.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			endedAt: { $exists: false },
			startedAt: { $gte: recent }
		}).sort({ startedAt: -1 })

		if (existing) {
			// If mode differs, update to current mode and reuse
			if (existing.mode !== mode) {
				existing.mode = mode
				await existing.save()
			}
			return res.json({ sessionId: existing._id, reused: true })
		}

		const doc = await StudySession.create({
			userId: new mongoose.Types.ObjectId(userId),
			mode,
			startedAt: startedAt ? new Date(startedAt) : now,
			durationSeconds: 0
		})
		// update streak for the day (idempotent for multiple sessions same day)
		try { await updateStudyStreak(userId, doc.startedAt) } catch (e) {}
		res.json({ sessionId: doc._id, reused: false })
	} catch (err) {
		res.status(500).json({ error: 'Failed to start session', details: err.message })
	}
}

export async function endSession(req, res) {
	try {
		const { sessionId, endedAt, durationSeconds, interruptions = 0, notesCount = 0 } = req.body
		if (!sessionId) return res.status(400).json({ error: 'sessionId required' })
		const update = {
			endedAt: endedAt ? new Date(endedAt) : new Date(),
			interruptions,
			notesCount
		}
		if (typeof durationSeconds === 'number') update.durationSeconds = Math.max(0, Math.floor(durationSeconds))
		const doc = await StudySession.findByIdAndUpdate(sessionId, update, { new: true })
		if (!doc) return res.status(404).json({ error: 'Session not found' })
		// if this update included a duration or endedAt, ensure streak is recorded
		try {
			if ((doc.durationSeconds || 0) > 0 || doc.endedAt) {
				await updateStudyStreak(doc.userId, doc.startedAt)
			}
		} catch (e) {}
		res.json({ ok: true })
	} catch (err) {
		res.status(500).json({ error: 'Failed to end session', details: err.message })
	}
}

export async function updateSessionMode(req, res) {
	try {
		const { sessionId, mode } = req.body
		if (!sessionId || !mode) return res.status(400).json({ error: 'sessionId and mode required' })
		const doc = await StudySession.findByIdAndUpdate(sessionId, { mode }, { new: true })
		if (!doc) return res.status(404).json({ error: 'Session not found' })
		res.json({ ok: true })
	} catch (err) {
		res.status(500).json({ error: 'Failed to update session mode', details: err.message })
	}
}

export async function completeSession(req, res) {
	try {
		const { userId, mode, startedAt, endedAt, durationSeconds, topic } = req.body
		if (!userId || !mode) return res.status(400).json({ error: 'userId and mode required' })
		const start = startedAt ? new Date(startedAt) : new Date()
		const end = endedAt ? new Date(endedAt) : new Date()
		const doc = await StudySession.create({
			userId: new mongoose.Types.ObjectId(userId),
			mode,
			topic: topic || 'Untitled Session',
			startedAt: start,
			endedAt: end,
			durationSeconds: typeof durationSeconds === 'number' ? Math.max(0, Math.floor(durationSeconds)) : Math.max(0, Math.floor((end - start)/1000))
		})
		try { await updateStudyStreak(userId, doc.startedAt) } catch (e) {}
		res.json({ sessionId: doc._id })
	} catch (err) {
		res.status(500).json({ error: 'Failed to complete session', details: err.message })
	}
}
