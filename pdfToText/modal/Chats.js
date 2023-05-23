import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  sessionToken: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
