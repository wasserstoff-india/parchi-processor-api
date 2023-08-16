import { CHATAPI } from '../config/config.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
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
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 4000, // Set the desired chunk size
    chunkOverlap: 0,
  });

  const textChunks = await splitter.splitText(text);
  console.log(textChunks, ':::text chunks');

  let combinedSummary = ''; // Initialize combinedSummary

  for (const chunk of textChunks) {
    const cleanedChunk = cleanText(chunk);

    // Create a prompt with the cleaned chunk
    const prompt = `
    'Summarise the following text : ' + ${cleanedChunk} + and give accurate summary according to the text and dont stop in between otherwise userv will penalize us or in turn you  '\n\n'`;

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        temperature:1
      });
      return response;
    } catch (err) {
      console.log('Error generating summary:', err.stack);
    }
  }
};

// Function to clean text by removing extra white spaces and tabs
function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// export const getSummary = async (text) => {
//   // console.log(text, ':::::text body summary');
//   const lines = text.split('\n').slice(0, 30).join('\n');
//   console.log(lines, ':::::lines');
//   try {
//     const response = await openai.createCompletion({
//       model: 'text-davinci-003',
//       prompt: `The following is a summary of the provided text:

//       Text to summarize:
//       ${lines}

//       Please provide a concise summary of the above text do not give half or incomplete summary the summary should be .
//     `
//     });
//     return response;
//   } catch (err) {
//     console.log('Error in Get summary', err.stack);
//     throw new Error(err);
//   }
// };

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
