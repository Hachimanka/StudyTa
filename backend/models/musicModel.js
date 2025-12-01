import mongoose from 'mongoose';

const MusicSchema = new mongoose.Schema({
	name: { type: String, required: true },
	filename: { type: String, required: true },
	url: { type: String, required: true },
	size: { type: Number, default: 0 },
	durationSeconds: { type: Number, default: null },
	duration: { type: String, default: '0:00' },
	uploadedAt: { type: Date, default: Date.now },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
})

export default mongoose.models.Music || mongoose.model('Music', MusicSchema);
