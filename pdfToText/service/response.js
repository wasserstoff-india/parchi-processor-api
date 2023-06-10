import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { CHATAPI } from '../config/config.js';
import { OpenAIApi, Configuration } from 'openai';
import Tesseract from 'tesseract.js';
const canvaspkg = require('canvas');
const { createCanvas, loadImage } = canvaspkg;

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
      model: 'gpt-3.5-turbo',
      messages: msgsArr,
    });

    const botResponse = response.data.choices[0].message.content;
    return botResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSummary = async (text, maxLength) => {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: 'Summarise the following text : ' + text + '\n\n',
      max_tokens: maxLength,
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

export async function createImageFromText(text) {
  try {
    const canvas = createCanvas('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 16;
    const fontFamily = 'Arial';
    context.font = `${fontSize}px ${fontFamily}`;
    const textMetrics = context.measureText(text);
    canvas.width = textMetrics.width;
    canvas.height = fontSize;
    context.font = `${fontSize}px ${fontFamily}`;
    context.textBaseline = 'top';
    context.fillText(text, 0, 0);
    const imageSrc = canvas.toDataURL('image/png');

    return imageSrc;
  } catch (error) {}
}

export const processImage = async (imageUrl) => {
  try {
    const { data } = await Tesseract.recognize(encodeURI(imageUrl), 'eng');
    const text = data.text;
    return text;
  } catch (error) {
    console.log('error', error);
  }
};
