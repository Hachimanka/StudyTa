import mongoose from 'mongoose'

const UserAnalyticsSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true },
	streak: { type: Number, default: 0 },
	lastStudyDate: { type: Date, default: null },
	topicsCompleted: { type: [String], default: [] },
}, { timestamps: true })

UserAnalyticsSchema.index({ userId: 1 })

export default mongoose.model('UserAnalytics', UserAnalyticsSchema)
