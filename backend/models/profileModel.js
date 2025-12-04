import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: { type: String, default: '' },
  username: { type: String, default: '' },
  bio: { type: String, default: '' },
  profileImageUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Profile', profileSchema);
