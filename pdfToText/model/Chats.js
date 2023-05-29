import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  sessionToken: {
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
        enum: ['user', 'assistant'],
        required: true,
      },
      message: {
        type: String,
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
