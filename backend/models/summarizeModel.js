import mongoose from 'mongoose';

const SummarizeSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: false },
	sourceText: { type: String, required: true },
	summaryText: { type: String, required: true },
	title: { type: String },
	fileName: { type: String },
	meta: { type: Object, default: {} },
}, { timestamps: true });

const Summarize = mongoose.models.Summarize || mongoose.model('Summarize', SummarizeSchema);
export default Summarize;
