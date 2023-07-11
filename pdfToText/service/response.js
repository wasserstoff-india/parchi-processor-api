import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { CHATAPI } from '../config/config.js';
import pkg from 'openai';
export const { OpenAIApi, ChatOpenAI, Configuration, LANGUAGES, FAISS } = pkg;
import Tesseract from 'tesseract.js';
import { create } from 'domain';
const canvaspkg = require('canvas');
const { createCanvas, loadImage } = canvaspkg;
export const conf = new Configuration({
  apiKey: CHATAPI,
});

const openaiii = new OpenAIApi(conf);

export const CreateCsv = async (text) => {
  try {
    const prompt = `I am providing you first five rows of a csv file which includes first row as header row. Your task is to analyze the rows and create a schema for the table. Schema should be in format : \n\n SCHEMA(TABLE_NAME:<table name> \n COLUMNS:[<column name, column type>] \n SUMMARY:<Description of the table about what it contains>). Reply only with the schema, and nothing else. Following are the first five rows \n\n ${text}`;
    const gptResponse = await openaiii.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
    });

    const response = gptResponse.data.choices[0].message.content;
    // console.log(response, '::::::response');
    return { text, content: response };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const CreateAction = async (messages, message, content) => {
  // console.log(content, ':::::content');
  // console.log(text, ':::::text');
  let MsgsArr = messages.map((msg) => {
    return { role: msg.sender, content: msg.message };
  });
  // console.log(message, ':::message');
  // let msgsArr = message.map((msg) => {
  //   return { role: msg.sender, content: msg.message[2] };
  // });
  // console.log(MsgsArr, '::msgsrarray');
  try {
    const actions = `Row to select (<array of condition  eg name=mary>) - Select specific rows based on a given condition or set of conditions.
    Sum of column (<column name eg:salary>, <array of condition eg:age>22>) - Calculate the sum of values in a specific column based on given conditions.
    Average of column (<column name eg:salary>, <array of condition eg:salary , gender=female>) - Calculate the average of values in a specific column based on given conditions.
    Sort and select (<column name eg:age>, <row to select eg:5>, <array of condition eg:gender=male>) - Sort the table based on a specific column, and select rows based on given conditions.`;
    const prompt = `We have a csv table with following schema: \n ${content}. \n\n Suggest me an action to be performed out of these actions   in order to answer user's query. Actions that can be performed are - ${actions}. The User has asked following question : \n ${MsgsArr}.  Reply in the format: ACTION: <action_name(arguments)>`;
    const ActionResponse = await openaiii.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
    });
    console.log(
      ActionResponse.data.choices[0].message.content,
      ':::ActionResponse'
    );
    const contents = ActionResponse.data.choices[0].message.content;
    const response = ActionResponse.data.choices[0].message;
    return { response, contents };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const CsvActionResponse = async (
  response,
  content,
  message,
  csvtext
) => {
  console.log(content, ':::content'); // content is the gpt response message
  try {
    let answer = '';
    if (typeof content === 'string' && content.includes('Row to select')) {
      // Extract the conditions from the action
      const conditionsMatch = content.match(/\[({[^}]+})\]/);
      console.log(conditionsMatch, ':::conditionsMatch');
      const conditions = conditionsMatch
        ? conditionsMatch[1].replace(/'/g, '"')
        : '';
      const csvArray = csvtext.split('\n').map((row) => row.split(','));

      // Perform the row selection based on conditions
      const selectedRows = csvArray.filter((row) => {
        const rowObj = JSON.parse(row);
        for (const condition of conditions) {
          const [key, value] = Object.entries(condition)[0];
          if (rowObj[key.trim()] !== value.trim()) {
            return false;
          }
        }
        return true;
      });

      // Get the answer based on the selected rows
      answer = JSON.stringify(selectedRows);
      console.log(answer, '::::answer');
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// const openaiiii = new OpenAIApi(conf);
// const models = new OpenAI({CHATAPI});
// export const vectorizeText = async (rows) => {
//   try {
//     const splitter = new CharacterTextSplitter({
//       chunkSize: 1536,
//       chunkOverlap: 200,
//     });
//     // console.log(splitter, '::::splitter');
//     console.log(rows.length);
//     const fileDocs = await splitter.createDocuments(rows, [], {
//       chunkHeader: `DOCUMENT NAME: File Interview\n\n---\n\n`,
//       appendChunkOverlapHeader: true,
//     });
//     // console.log(fileDocs, '::::fileDocs');

//     const textContent = fileDocs.map((doc) => doc.text).join(' ');
//     const response = await openaiiii.createEmbedding({
//       model: 'text-embedding-ada-002',
//       input: [textContent],
//     });
//     console.log(response.data?.data[0]?.embedding, ':::response');

//     const embeddings = response.data?.data[0]?.embedding;
//     const documents = embeddings.map((embedding) => ({
//       vector: embedding.slice(0, 100),
//     }));

//     const vectorStore = await Vector.insertMany(documents);
//     // console.log(vectorStore, '::::vector store');

//     const retrieveResults = async (queryText, k) => {
//       const input = JSON.stringify(vectorStore.map((item) => item.vector));
//       const response = await openaiiii.createEmbedding({
//         model: 'text-embedding-ada-002',
//         input: input,
//         query: queryText,
//         numResults: k,
//       });

//       return response.data;
//     };

//     // Query the vector store
//     const queryText = 'lastName of mary'; // Replace with your query text
//     const k = 5; // Number of results to retrieve
//     const results = await retrieveResults(queryText, k);

//     console.log(results);
//     return results;
//   } catch (error) {
//     console.log(error.response);
//     throw error;
//   }
// };

// const Vectorretriever = async (vectors) => {
//   const chain = RetrievalQAChain.fromLLM({
//     model: models,a
//     retriever: vectors,
//   });
//   console.log(chain, ':::::chains');
//   const res = await chain.call({ query: question });
//   console.log(res, '::::res');
//   return res;
// };

// const openaiii = new OpenAIApi(conf);
// export const uploadDataToAPI = async (jsonData) => {
//   try {
//     const response = await openaiii.createFile({
//       file: 'data.jsonl',
//       data: JSON.stringify(jsonData),
//       purpose: 'fine-tune',
//     });

//     return response.data;
//   } catch (err) {
//     console.log('Error uploading data to OpenAI Data API: ' + err);
//     throw err;
//   }
// };

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
      prompt:
        'Process the following excel file and get yourself trained ' +
        text +
        '\n\n',
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
