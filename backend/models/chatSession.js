import mongoose from 'mongoose';

// Updated to match requested minimal fields while keeping flexibility.
const ChatSessionSchema = new mongoose.Schema({
  // explicit session id string (in addition to _id)
  session_id: { type: String, default: () => new mongoose.Types.ObjectId().toString(), index: true },
  // owner / initiator of the session
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
  // timestamps requested
  started_at: { type: Date, default: Date.now },
  ended_at: { type: Date, default: null },
  // optional human-friendly title
  title: { type: String, default: '' },
  // preserve metadata for future needs
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Indexes to support listing sessions by user and recent activity
ChatSessionSchema.index({ user_id: 1, started_at: -1 });

export default mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
