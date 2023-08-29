import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const MONDODB_URL = process.env.MONDODB_URL;
export const SUMMARY_URL = process.env.SUMMARY_URL;
export const VISION_API = process.env.VISIONAPI;
export const CHATAPI = process.env.CHATAPI;
export const VISIONKEY = process.env.VISIONAPIKEY;
export const SECRETKEY = process.env.SECRETKEY;
export const PINECONE_ENVIOROMENTKEY = process.env.PINECONE_ENVIORNMENT_KEY;
export const PINECONE_ENVIOROMENTKEYAPIKEY = process.env.PINECONE_API_KEY;

export const systemMessage = `
    I will give you the summary of the text file based on that summary user will ask you the questions and you have to respond the relevant answer based on summary.

    For example:
    Summary: 
    User: 
    Assistant:
    User 
    Assistant
`;

export const Init_conversation = [
  {
    role: 'user',
    message: '',
  },

  {
    role: 'assistant',
    message: '',
  },
];
