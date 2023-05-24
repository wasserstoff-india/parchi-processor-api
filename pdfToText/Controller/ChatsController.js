import axios from 'axios';

import Chat from '../modal/Chats.js';
import cryptp from 'crypto';

import { CHATAPI } from '../config/config.js';
import { OpenAIApi, Configuration } from 'openai';
const conf = new Configuration({
  apiKey: `${CHATAPI}`,
});
const openai = new OpenAIApi(conf);
export const getBotResponse = async (message) => {
  console.log(message, ':::message');
  // console.log(await openai.retrieveModel(MODEL_ID))
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: 'explain ' + message + '\n\n',
    max_tokens: 1000,
    temperature: 0,
    frequency_penalty: 2,
    stop: '\n',
  });
  console.log(JSON.stringify(response.data.choices));
  return response.data.choices[0].text;
};

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

// export const Chats = async (req, res) => {
//   console.log(req.body, ':::::body');
//   try {
//     const { userId, message, botMessage, summary, sessionId } = req.body; // Extract the 'summary' value from req.body
//     const sess = await Chat.findOne({ sessionToken: sessionId });
//     let chatSession;
//     if (sess) {
//       chatSession = sess.id;
//     } else {
//       const sessionToken = generateSessionToken(); // Generate session token
//       chatSession = new Chat({ userId, sessionToken }); // Include session token in the Chat model
//       await chatSession.save();
//       req.session.chatSession = chatSession.id;
//       console.log(sessionToken, ':::::sessiontoken');
//     }

//     await updateChatSession(chatSession, message, botMessage, summary); // Pass the 'summary' value

//     res.status(200).json(chatSession);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const updateChatSession = async (id, message, botMessage, summary) => {
//   try {
//     const chatSession = await Chat.findById(id);

//     if (!chatSession) {
//       throw new Error('Chat session not found.');
//     }

//     chatSession.messages.push(
//       { sender: 'user', message: message.toString() },
//       { sender: botMessage.role, message: botMessage.content.toString() }
//     );

//     if (summary) {
//       // Check if 'summary' value is provided
//       chatSession.summary = summary; // Assign 'summary' to chatSession.summary
//     }

//     if (chatSession.messages.length > 10) {
//       chatSession.messages = chatSession.messages.slice(-10);
//     }

//     await chatSession.save();
//     console.log('chat session ', chatSession);
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// };

export const Chats = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, message, sessionId } = req.body;

    const sess = await Chat.findOne({ sessionToken: sessionId });
    let chatSession;
    if (sess) {
      chatSession = sess.id;
    } else {
      const sessionToken = generateSessionToken();
      chatSession = new Chat({ userId, sessionToken });
      await chatSession.save();
      req.session.chatSession = chatSession.id;
      console.log(sessionToken, ':::::sessiontoken');
    }

    const botMessage = await getBotResponse(message);

    await updateChatSession(chatSession, message, botMessage);

    res.status(200).json(chatSession);
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
      { sender: 'bot', message: botMessage.toString() }
    );

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

// export const getBotResponse = async (message) => {
//   try {
//     const response = await axios.post(
//       SUMMARY_URL,
//       {
//         model: 'text-davinci-003',
//         prompt: 'explain ' + message + '\n\n',
//         max_tokens: 1024,
//         temperature: 0,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: 'Bearer ' + CHATAPI,
//         },
//       }
//     );

//     return response.data.choices[0].text.trim();
//   } catch (error) {
//     console.log('Error in getBotResponse:', error);
//     throw error;
//   }
// };

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
