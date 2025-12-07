import mongoose from 'mongoose'

const StudySessionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
	mode: { type: String, enum: ['focus','pomodoro','flashcards','quiz','reading','custom'], required: true },
	startedAt: { type: Date, required: true },
	endedAt: { type: Date },
	durationSeconds: { type: Number, default: 0 },
	notesCount: { type: Number, default: 0 },
	interruptions: { type: Number, default: 0 },
}, { timestamps: true })

StudySessionSchema.index({ userId: 1, startedAt: -1 })

export default mongoose.model('StudySession', StudySessionSchema)
