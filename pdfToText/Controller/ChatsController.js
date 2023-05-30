import axios from 'axios';
import Chat from '../model/Chats.js';
import { getBotResponse } from '../service/response.js';
import { generateSessionToken } from '../service/session.js';

export const Chats = async (req, res) => {
  try {
    const { userData, message, sessionId, summary } = req.body;

    if (summary && userData.waId && userData.waProfile.name && !sessionId) {
      // create chatsesssion
      const sessionToken = generateSessionToken();
      const chatSession = new Chat({ sessionToken, summary });
      chatSession.messages.push(
        {
          sender: 'user',
          message:
            'This is the summary you generated from a log text - ' +
            summary +
            '.\n\n Now I will Ask you questiones based on this summary. Act as a really supportive and inteligent assistant bot.',
        },
        {
          sender: 'assistant',
          message: 'Awesome. I got it. Shoot me questions.',
        }
      );
      await chatSession.save();
      return res.status(200).json({ sessionId: sessionToken });
    }

    if (sessionId && message) {
      const chatSession = await Chat.findOne({ sessionToken: sessionId });

      const msgObj = {
        sender: 'user',
        message: message,
      };
      chatSession.messages.push(msgObj);

      if (chatSession.messages.length >= 11) {
        chatSession.messages = [
          chatSession.messages[0],
          chatSession.messages[1],
          ...chatSession.messages.slice(-8),
        ];
      }

      const botMessage = await getBotResponse(chatSession.messages);

      await updateChatSession(chatSession._id, message, botMessage);

      return res.status(200).json({ chatSession, botMessage });
    }
    return res.status(401).json({ message: 'Bad formed Request.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateChatSession = async (id, message, botMessage) => {
  try {
    const chatSession = await Chat.findById(id);

    if (!chatSession) {
      throw new Error('Chat session not found.');
    }

    chatSession.messages.push(
      { sender: 'user', message: message.toString() },
      { sender: 'assistant', message: botMessage.toString() }
    );
    await chatSession.save();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
