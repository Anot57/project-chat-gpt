const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // user temporarily disabled
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false // ✅ make optional
  },
  title: {
    type: String,
    required: true
  },
  messages: [
    {
      role: { type: String, enum: ['user', 'ai', 'system'], default: 'user' },
      content: { type: String, required: true }
    }
  ],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const chatModel = mongoose.model("chat", chatSchema);
module.exports = chatModel;
