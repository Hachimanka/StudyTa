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
  // Store avatar image directly in MongoDB as Base64 encoded string
  avatarData: { type: String, default: '' },
  // Store the MIME type of the avatar (e.g., 'image/png', 'image/jpeg')
  avatarMimeType: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Profile', profileSchema);
