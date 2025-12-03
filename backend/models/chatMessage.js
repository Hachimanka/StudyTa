import mongoose from 'mongoose';

// Simplified message schema to match requested fields while keeping compatibility
const ChatMessageSchema = new mongoose.Schema({
  // explicit message id string
  message_id: { type: String, default: () => new mongoose.Types.ObjectId().toString(), index: true },
  // link to session (string id or ObjectId)
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
  // who sent the message
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
  // message content
  content: { type: String, required: true },
  // created timestamp
  created_at: { type: Date, default: Date.now, index: true },

  // backward-compatible fields (optional)
  type: { type: String, default: 'text' },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  editedAt: { type: Date, default: null },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
});

ChatMessageSchema.index({ session_id: 1, created_at: 1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
