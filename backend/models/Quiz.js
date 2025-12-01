import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // optional for now
  title: { type: String, required: true },
  mode: { type: String, required: true },
  questions: { type: Array, default: [] },
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Quiz', QuizSchema);
