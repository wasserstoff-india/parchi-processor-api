import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { CHATAPI } from '../config/config.js';
import pkg from 'openai';
export const { OpenAIApi, ChatOpenAI, Configuration, LANGUAGES, FAISS } = pkg;
import Tesseract from 'tesseract.js';
import { create } from 'domain';
import Chat from '../modal/Chats.js';
const csv = require('csv-parser');
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

export const CreateAction = async (message, content, storedContent) => {
  console.log(storedContent, '::storedContent Array');
  let msgsArr = message.map((msg) => {
    return { role: msg.sender, content: msg.message };
  });
  try {
    const actions = `$$$ row_to_select (  <column filters eg (name=mary)>) $$$ - Select the rows based on given conditions.  \n\n
    $$$ sum_of_column (<column name eg:salary>,  <column filters eg:(age>22)>) $$$ - Calculate the sum of values in a specific column based on given conditions. \n\n
    $$$ average_of_column (<column name eg:salary>,  <column filters eg:(salary>10000) , gender=female>) $$$ - Calculate the average of values in a specific column based on given conditions. \n\n
    $$$ sort_and_select (<column name eg:age>,<sort order eg:asc/desc> <numbers of rows to select eg:5>,  <column filters eg:gender=male>) $$$- Sort the table based on a specific column, and select rows based on given conditions.`;
    const prompt = `We have a csv table with following schema: \n ${storedContent}. \n\n Suggest me an action to be performed out of these actions   in order to answer user's query and the action should be in lowercase. Actions that can be performed are - ${actions}.\n\n The User has asked following question : \n ${JSON.stringify(
      msgsArr
    )}. \n\n Reply in the format: ACTION:$$$ <action_name(arguments)> $$$. And say nothing more. \n\n
    Also provide the operation based on the ${JSON.stringify(msgsArr)}`;

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
  message,
  response,
  content,
  csvtext
) => {
  try {
    const actionRegex = /ACTION:\$\$\$\s*(\w+)\s*[^$]*\$\$\$/i;

    const criteriaRegex = /\(([^()]+)\)/g;

    const regex = /(?<=\s|^)(\w+)(?=\s|$)/g;
    let Content = content?.content ?? content;
    const matches = Content.match(regex);
    console.log(matches, '::matches');
    if (matches) {
      const positionedValue = matches.pop();
      console.log(positionedValue, ':::positionedValue');
    }

    const actionMatch = Content.match(actionRegex);
    const criteriaMatches = Content.match(criteriaRegex);
    console.log(
      actionMatch,
      ':::action match',
      criteriaMatches,
      ':::criteria match'
    );

    if (!actionMatch || !criteriaMatches) {
      throw new Error('Invalid content format. Action or criteria not found.');
    }

    const action = actionMatch[1];
    console.log('Action:', action);

    const criteriaArray = criteriaMatches.map((criteria) =>
      criteria.slice(1, -1).trim()
    );
    console.log('Criteria:', criteriaArray);

    const RowValues = criteriaArray.flatMap((criteria) => {
      return criteria.split(',').map((column) => column.trim().split('=')[1]);
    });
    console.log('Row Values:', RowValues);

    // Convert CSV text to lowercase and replace gaps (spaces) in column names
    const modifiedCsvText = csvtext.toLowerCase().replace(/ /g, '');

    // Read the CSV data
    const rows = [];
    const csvStream = csv({
      mapHeaders: ({ header }) => header.toLowerCase().replace(/ /g, ''),
    });
    csvStream.write(modifiedCsvText);
    csvStream.end();
    let selectedRows = null;
    let selectedRow = null;
    // let filteredRows = null;
    return await new Promise((resolve, reject) => {
      csvStream
        .on('data', async (data) => {
          rows.push(data);
        })
        .on('end', async () => {
          // here we have to make the calculation of the action by ourself and just passed to gpt with the result

          // if (action === 'row_to_select') {
          //   if (RowValues) {
          //     // Second logic when RowValues is present
          //     selectedRow = rows.filter((row) => {
          //       for (const column in row) {
          //         if (RowValues.includes(row[column])) {
          //           return selectedRow;
          //         }
          //       }
          //       return false;
          //     });
          //     console.log(selectedRow, '::selected row');
          //   } else {
          //     // First logic when RowValues is not present
          //     const SortColumn = criteriaArray[0].split(/[><]=?/)[0].trim();
          //     console.log(SortColumn, ':::sort column');
          //     const operator = criteriaArray[0].match(/[><]=?/)[0];
          //     console.log(operator, ':::operator column');
          //     const number = parseFloat(criteriaArray[0].match(/\d+/)[0]);
          //     console.log(number, ':::number column');
          //     const filteredRows = rows.filter((row) => {
          //       const columnValue = parseFloat(
          //         row[SortColumn].replace(/[^0-9.-]+/g, '')
          //       );
          //       console.log(filteredRows, ':::filtered rows');
          //       switch (operator) {
          //         case '>':
          //           return columnValue > number;
          //         case '<':
          //           return columnValue < number;
          //         case '>=':
          //           return columnValue >= number;
          //         case '<=':
          //           return columnValue <= number;
          //         default:
          //           return false;
          //       }
          //     });
          //     console.log(filteredRows, ':::filtered rows');
          //     return filteredRows;
          //   }
          // }

          if (action === 'sum_of_column') {
            selectedRows = rows.filter((row) => {
              for (const column in row) {
                if (RowValues.includes(row[column])) {
                  return true;
                }
              }
              return false;
            });
            console.log(selectedRows, '::selected rows');
            const headerKeys = Object.keys(selectedRows[0]);
            console.log(headerKeys, '::headerkeys');
            const searchText = message.toLowerCase();
            console.log(searchText, '::searchText');

            let sum = 0;
            let count = 0;
            for (const key of headerKeys) {
              const value = key.toLowerCase();
              if (searchText.includes(value)) {
                for (const row of selectedRows) {
                  const columnValue = row[key];
                  if (columnValue) {
                    const numericValue = parseFloat(
                      columnValue.replace(/[^0-9.-]+/g, '')
                    );
                    sum += numericValue;
                    count++;
                  }
                  console.log(columnValue, '::::column value');
                  console.log(sum, ':::sum', count, ':::count');
                  resolve(sum);
                }
              }
            }
          } else if (action === 'average_of_column') {
            console.log('22222');
            console.log(rows, ':::rows');
            console.log('Row values: ', rows.length, RowValues);
            selectedRows = rows.filter((row) => {
              for (const column in row) {
                if (RowValues.includes(row[column])) {
                  return true;
                }
              }
              return false;
            });
            console.log(selectedRows, ':::selected rows');
            const headerKeys = Object.keys(selectedRows[0]);
            console.log(headerKeys, '::headerkeys');
            const searchText = message.toLowerCase();
            console.log(searchText, '::searchText');

            let sum = 0;
            let count = 0;
            for (const key of headerKeys) {
              const value = key.toLowerCase();
              if (searchText.includes(value)) {
                for (const row of selectedRows) {
                  const columnValue = row[key];
                  if (columnValue) {
                    const numericValue = parseFloat(
                      columnValue.replace(/[^0-9.-]+/g, '')
                    );
                    sum += numericValue;
                    console.log(sum, ':::summmmm');
                    console.log(count, ':::count');
                    count++;
                  }
                  const average = sum / count;
                  console.log(`Average of the ${key}`, average);
                  resolve(average);
                }
              }
            }
          } else if (action === 'row_to_select') {
            console.log('12346');
            if (RowValues[0] === undefined) {
              console.log('12346');
              const SortColumn = criteriaArray[0].split(/[><]=?/)[0].trim();
              console.log(SortColumn, ':::sort column');
              const operator = criteriaArray[0].match(/[><]=?/)[0];
              console.log(operator, ':::operator column');
              const number = parseFloat(criteriaArray[0].match(/\d+/)[0]);
              console.log(number, ':::number column');
              const filteredRows = rows.filter((row) => {
                const columnValue = parseFloat(
                  row[SortColumn].replace(/[^0-9.-]+/g, '')
                );
                switch (operator) {
                  case '>':
                    return columnValue > number;
                  case '<':
                    return columnValue < number;
                  case '>=':
                    return columnValue >= number;
                  case '<=':
                    return columnValue <= number;
                  default:
                    return false;
                }
              });
              console.log(filteredRows, ':::filtered rows');
              resolve(filteredRows);
            } else {
              console.log(RowValues, ':::rowvaluessssss');
              selectedRows = rows.filter((row) => {
                for (const column in row) {
                  // console.log(row.column, ':::column');
                  if (RowValues.includes(row[column])) {
                    return true;
                  }
                }
                return false;
              });
              console.log(selectedRows, '::selecteddddddd rows');
              resolve(selectedRows);
            }
          }
        });
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GptResponseCsv = async (message, messages, csvResponse) => {
  // console.log('Start get gpt Response ');
  // console.log(csvResponse, ':::return csvResponse csv ');

  let msgsArr = messages.map((msg) => {
    return { role: msg.sender, content: msg.message };
  });

  // Add the prompt message to the msgsArr
  const promptMessage = {
    role: 'system',
    content: `Based on the given result answer the following question of the user message. \n\n result : ${JSON.stringify(
      csvResponse
    )} \n\n Question :${msgsArr
      .map((msg) => `{ role: '${msg.role}', content: '${msg.content}' }`)
      .join(', ')}\n\n.`,
  };
  msgsArr.push(promptMessage);

  // console.log(msgsArr, 'msgarray');

  try {
    const ActionResponse = await openaiii.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: msgsArr,
    });

    console.log(
      ActionResponse.data.choices[0].message.content,
      ':::ActionResponse'
    );

    const response = ActionResponse.data.choices[0].message.content;
    console.log('response in GPTResponse CSV: ******************');
    return response;
  } catch (error) {
    console.log(error.data);
    throw error;
  }
};

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
