import express from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import StudySession from '../models/analyticsModel.js';

const router = express.Router();

// TEMP: dummy user id until auth is implemented
const TEMP_USER_ID = '507f1f77bcf86cd799439011';

// Save a quiz (title, mode, questions, score) and record analytics
router.post('/save-quiz', async (req, res) => {
	try {
		const { title, mode, questions, score, total, userId, durationMinutes } = req.body;
		if (!title || !mode || !Array.isArray(questions)) {
			return res.status(400).json({ error: 'title, mode and questions are required' });
		}

		const finalUserId = userId || TEMP_USER_ID;

		const quiz = new Quiz({
			userId: finalUserId,
			title,
			mode,
			questions,
			score: typeof score === 'number' ? score : 0,
			total: typeof total === 'number' ? total : questions.length,
		});

		await quiz.save();

		// Also record an analytics session for this topic (counts as topic covered)
		try {
			// Only record if we have a valid MongoDB ObjectId
			if (mongoose.Types.ObjectId.isValid(finalUserId)) {
				const session = new StudySession({
					userId: new mongoose.Types.ObjectId(finalUserId),
					topic: title,
					durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : 1,
					occurredAt: new Date(),
				});
				await session.save();
			}
		} catch (analyticsErr) {
			// Don't fail the quiz save if analytics fails
			console.warn('Analytics recording failed:', analyticsErr.message);
		}

		res.status(201).json({ message: 'Quiz saved', quizId: quiz._id });
	} catch (err) {
		console.error('Save quiz error:', err);
		res.status(500).json({ error: 'Failed to save quiz', details: err.message });
	}
});

// Get quizzes for a user
router.get('/quizzes/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const id = userId || TEMP_USER_ID;
		const quizzes = await Quiz.find({ userId: id }).sort({ createdAt: -1 }).limit(50);
		res.json({ quizzes });
	} catch (err) {
		console.error('Get quizzes error:', err);
		res.status(500).json({ error: 'Failed to fetch quizzes', details: err.message });
	}
});

export default router;
