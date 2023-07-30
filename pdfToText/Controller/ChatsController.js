import axios from 'axios';
import Chat from '../modal/Chats.js';
import {
  CreateAction,
  CsvActionResponse,
  GptResponseCsv,
  // CreateCsv,
  getBotResponse,
  // CsvActionResponse,
  // GptResponseCsv,
} from '../service/response.js';
import { generateSessionToken } from '../service/session.js';

export const Chats = async (req, res) => {
  try {
    const { userData, message, sessionId, summary, content, csvtext } =
      req.body;
    // console.log(message, content, ':::::message and content');

    if (summary && userData.waId && userData.waProfile.name && !sessionId) {
      // create chatsesssion
      const sessionToken = generateSessionToken();
      const chatSession = new Chat({ sessionToken, summary, content });
      chatSession.messages.push(
        {
          sender: 'user',
          message:
            'This is the excel file with the first column as the inf ' +
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

    //   chatSession.messages.push(
    //     {
    //       sender: 'user',
    //       message:
    //         'This is the summary you generated from a log text - ' +
    //         summary +
    //         '.\n\n Now I will Ask you questiones based on this summary. Act as a really supportive and inteligent assistant bot.',
    //     },
    //     {
    //       sender: 'assistant',
    //       message: 'Awesome. I got it. Shoot me questions.',
    //     }
    //   );
    //   await chatSession.save();
    //   return res.status(200).json({ sessionId: sessionToken });
    // }

    if (sessionId && message) {
      const chatSession = await Chat.findOne({ sessionToken: sessionId });

      const msgObj = {
        sender: 'user',
        message,
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
      const storedContent = chatSession.content;
      // console.log(storedContent, '::storedContenttttttttttt Array');

      await updateChatSession(chatSession._id, message, botMessage);

      const createActionresponse = await CreateAction(
        message,
        storedContent,
        csvtext
      );

      // const csvResponse = await CsvActionResponse(message, csvtext);
      // console.log('get CSV response: ', csvResponse);
      // // console.log('end CSV---------------');
      // // console.log(csvResponse, ':::csv response chat controller');
      // const newBotResponse = await GptResponseCsv(
      //   message,
      //   chatSession.messages
      // );

      return res.status(200).json({ chatSession, botMessage, createActionresponse });
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
