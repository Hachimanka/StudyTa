import mongoose from 'mongoose'

const StudySessionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
	topic: { type: String, required: true },
	durationMinutes: { type: Number, required: true },
	// timestamp of when the session happened
	occurredAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true })

const StudySession = mongoose.models?.StudySession || mongoose.model('StudySession', StudySessionSchema)

export default StudySession
