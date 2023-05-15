import Chat from '../modal/Chats.js';
import cryptp from 'crypto';

const generateSessionToken = () => {
  const length = 16;
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
};

export const Chats = async (req, res) => {
  console.log(req.body, ':::::body');
  try {
    const { userId, message } = req.body;
    let chatSession;
    if (req.session.chatSession) {
      chatSession = req.session.chatSession;
    } else {
      const sessionToken = generateSessionToken(); // Generate session token
      chatSession = new Chat({ userId, sessionToken }); // Include session token in the Chat model
      await chatSession.save();
      req.session.chatSession = chatSession.id;
      console.log(sessionToken, ':::::sessiontokren');
    }
    chatSession.messages.push({ sender: 'user', message });
    await chatSession.save();
    res.status(200).json(chatSession);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
