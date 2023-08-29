import axios from 'axios';
import path from 'path';
import Chat from '../modal/Chats.js';
import { CreateAction, getBotResponse } from '../service/response.js';
import { generateSessionToken } from '../service/session.js';
import { CreatepdfAction, PineconeAction } from '../service/pdf.js';

export const Chats = async (req, res) => {
  try {
    const {
      userData,
      message,
      sessionId,
      summary,
      content,
      csvtext,
      text,
      fileUrl,
    } = req.body;
    console.log(fileUrl, '::::fileurl');
    const fileExtension = path.extname(fileUrl);
    console.log(fileExtension, '::::fileExtension');

    if (summary && userData.waId && userData.waProfile.name && !sessionId) {
      // create chatsesssion
      // 

      const sessionToken = generateSessionToken();
      const chatSession = new Chat({ sessionToken, summary, content, fileUrl });
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
      const lastChatSession = await Chat.findOne({}, {}, { sort: { _id: -1 } });

      if (lastChatSession) {
        const lastChatSessionId = lastChatSession._id;
        
        console.log('Last Chat Session ID:', lastChatSessionId);
      } 
      const PineconeStore = await PineconeAction(text,lastChatSession._id);
      
      return res.status(200).json({ sessionId: sessionToken,PineconeStore });
    }

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

      const 
      botMessage = await getBotResponse(chatSession.messages);
      const storedContent = chatSession.content;
      
      await updateChatSession(chatSession._id, message, botMessage, fileUrl);

     
      let createActionresponse, createpdfresponse;
    
      if (fileExtension === '.pdf') {
        console.log('goes in the create pdf response');
        // If the file extension is '.pdf', call CreatepdfAction
        createpdfresponse = await CreatepdfAction(
          message,
          chatSession._id,
          storedContent,
          text,
        
        );
       
      } else if (fileExtension === '.csv' || fileExtension === '.xlsx') {
        // If the file extension is '.csv' or '.xlsx', call CreateAction
        console.log('goes in create action');
        createActionresponse = await CreateAction(
          message,
          storedContent,
          csvtext   
        );
      
      } else {
        // Handle the case when the file type is not recognized
        throw new Error('Unsupported file type.');
      }
      return res.status(200).json({
        chatSession,
        botMessage,
        createpdfresponse
      });
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
