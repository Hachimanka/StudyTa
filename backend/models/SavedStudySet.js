import mongoose from 'mongoose';

const SavedStudySetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    title: { type: String, required: true },
    mode: { type: String, required: true },
    questions: { type: Array, required: true },
    durationMinutes: { type: Number },
  },
  { timestamps: true }
);

const SavedStudySet = mongoose.model('SavedStudySet', SavedStudySetSchema);
export default SavedStudySet;
