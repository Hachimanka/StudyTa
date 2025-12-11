import mongoose from 'mongoose';

const CalendarEventSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
	title: { type: String, required: true },
	description: { type: String },
	start: { type: Date, required: true },
	end: { type: Date },
	allDay: { type: Boolean, default: false },
	priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { timestamps: true });

export default mongoose.model('CalendarEvent', CalendarEventSchema);
