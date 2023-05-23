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
    const { userId, message, botMessage, summary, sessionId } = req.body; // Extract the 'summary' value from req.body
    const sess = await Chat.findOne({ sessionToken: sessionId });
    let chatSession;
    if (sess) {
      chatSession = sess.id;
    } else {
      const sessionToken = generateSessionToken(); // Generate session token
      chatSession = new Chat({ userId, sessionToken }); // Include session token in the Chat model
      await chatSession.save();
      req.session.chatSession = chatSession.id;
      console.log(sessionToken, ':::::sessiontoken');
    }

    await updateChatSession(chatSession, message, botMessage, summary); // Pass the 'summary' value

    res.status(200).json(chatSession);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateChatSession = async (id, message, botMessage, summary) => {
  try {
    const chatSession = await Chat.findById(id);

    if (!chatSession) {
      throw new Error('Chat session not found.');
    }

    chatSession.messages.push(
      { sender: 'user', message: message.toString() },
      { sender: botMessage.role, message: botMessage.content.toString() }
    );

    if (summary) {
      // Check if 'summary' value is provided
      chatSession.summary = summary; // Assign 'summary' to chatSession.summary
    }

    if (chatSession.messages.length > 10) {
      chatSession.messages = chatSession.messages.slice(-10);
    }

    await chatSession.save();
    console.log('chat session ', chatSession);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// const generateSessionToken = () => {
//   const length = 16;
//   const characters =
//     'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let token = '';

//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     token += characters.charAt(randomIndex);
//   }

//   return token;
// };

// export const Chats = async (req, res) => {
//   console.log(req.body, ':::::body');
//   try {
//     const { userId, message, botMessage } = req.body;
//     let chatSession;
//     if (req.session.chatSession) {
//       chatSession = req.session.chatSession;
//     } else {
//       const sessionToken = generateSessionToken(); // Generate session token
//       chatSession = new Chat({ userId, sessionToken }); // Include session token in the Chat model
//       await chatSession.save();
//       req.session.chatSession = chatSession.id;
//       console.log(sessionToken, ':::::sessiontoken');
//     }

//     chatSession.messages.push(
//       { sender: 'user', message: message.toString() },
//       { sender: botMessage.role, message: botMessage.content.toString() }
//     );

//     await chatSession.save();
//     res.status(200).json(chatSession);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// }
