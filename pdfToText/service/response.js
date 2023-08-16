import { CHATAPI } from '../config/config.js';
import { OpenAIApi, Configuration } from 'openai';

export const conf = new Configuration({
  apiKey: CHATAPI,
});
const openai = new OpenAIApi(conf);
export const getBotResponse = async (message) => {
  let msgsArr = message.map((msg) => {
    return { role: msg.sender, content: msg.message };
  });
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      messages: msgsArr,
    });

    const botResponse = response.data.choices[0].message.content;
    return botResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getSummary = async (text) => {
  // console.log(text, ':::::text body summary');
  const lines = text.split('\n').slice(0, 30).join('\n');
  console.log(lines, ':::::lines');
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `The following is a summary of the provided text:
    
      Text to summarize:
      ${lines}
      
      Please provide a concise summary of the above text.
    `
    });
    return response;
  } catch (err) {
    console.log('Error in Get summary', err.stack);
    throw new Error(err);
  }
};

const openaii = new OpenAIApi(conf);
export const getBotResponsesummary = async (message, summary) => {
  try {
    const response = await openaii.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const botResponse = response.data.choices[0].message.content;
    return botResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
