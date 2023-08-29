import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import {
  CHATAPI,
  PINECONE_ENVIOROMENTKEY,
  PINECONE_ENVIOROMENTKEYAPIKEY,
} from '../config/config.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeClient } from '@pinecone-database/pinecone';
import pkg from 'openai';
import Chunks from '../modal/PdfChunks.js';
export const { OpenAIApi, Configuration } = pkg;

const pinecone = new PineconeClient();
await pinecone.init({
  environment: PINECONE_ENVIOROMENTKEY,
  apiKey: PINECONE_ENVIOROMENTKEYAPIKEY,
});
const indexName = 'parchii-wasserstoff';
export const conf = new Configuration({
  apiKey: CHATAPI,
});
const openaiii = new OpenAIApi(conf);

// 1-splitiing text into chunks

export const TextSplitter = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 1,
  });
  try {
    const fileDocs = await splitter.createDocuments([text]);
    const documentsToSave = fileDocs.map((doc) => ({
      pageContent: doc.pageContent,
    }));
    const savedChunks = await Chunks.create(documentsToSave);
    return savedChunks;
  } catch (error) {
    console.error('Error splitting text:', error);
    return null;
  }
};

export const PineconeAction = async (text, id) => {
  const chatSessionId = id.toString();
  const splitter = await TextSplitter(text);
  try {
    const embeddingArray = [];

    // Loop through each object in the splitter array
    for (const doc of splitter) {
      const response = await openaiii.createEmbedding({
        model: 'text-embedding-ada-002',
        input: doc.pageContent, // Use the content of the current object
      });

      const embeddingArray = response.data?.data[0]?.embedding;
      await saveEmbeddingsToPinecone(embeddingArray, doc._id, chatSessionId);
    }
    return embeddingArray;
  } catch (error) {
    // Handle errors
    console.error('Error creating embeddings:', error);
  }
};

export const CreatepdfAction = async (message, chatSessionId) => {
  const sessionId = chatSessionId.toString();
  try {
    const response = await openaiii.createEmbedding({
      model: 'text-embedding-ada-002',
      input: message,
    });
    const UserembeddingArray = response.data?.data[0]?.embedding;
    const pineconeIndex = pinecone.Index(indexName);
    const queryResponse = await pineconeIndex.query({
      queryRequest: {
        vector: UserembeddingArray,
        topK: 5,
        includeMetadata: true,
        filter: {
          chat_id: { $eq: sessionId },
        },
      },
    });
    // Get the ID of the top result
    const topResult = queryResponse.matches[0];
    const secondTopResult = queryResponse.matches[1];

    let selectedId;
    // Select the top 2 IDs if scores are >= 7, otherwise select the top ID
    if (topResult.score >= 0.7 && secondTopResult.score >= 0.7) {
      selectedId = [topResult.id, secondTopResult.id];
    } else {
      selectedId = [topResult.id];
    }
    // Call a function to find the corresponding object ID in the chunk database
    const UserResponse = await UserGptAction(message, selectedId);
    return UserResponse;
  } catch (error) {
    // Handle errors
    console.error('Error creating embeddings:', error);
  }
};

export const UserGptAction = async (message, selectedId) => {
  const chunkId = await Chunks.find({ _id: { $in: selectedId } });
  console.log(chunkId, ':::chunk');
  try {
    const prompts = chunkId.map((chunk) => ({
      role: 'system',
      content:
        `User, please carefully read the following information and then provide the correct answer to your question based on the content provided:\n\n` +
        `=== User Question ===\n"${message}"\n\n` +
        `=== Page Content ===\n"${chunk.pageContent}"\n\n` +
        `=== Your Answer ===\nPlease type your answer here:`,
    }));
    const gptResponse = await openaiii.createChatCompletion({
      model: 'gpt-3.5-turbo-16k-0613',
      messages: prompts
    });

    const responses = gptResponse.data.choices[0].message.content;
    console.log(responses, '::::::responses');
    return responses;
  } catch (error) {
    console.error(error);
  }
};

export const saveEmbeddingsToPinecone = async (
  embeddingArray,
  id,
  chatSessionId
) => {
  try {
    const ObjectId = id.toString();
    // Check if the index already exists
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.includes(indexName);

    // Create the index if it doesn't exist
    if (!indexExists) {
      const newIndex = await pinecone.createIndex({
        createRequest: {
          name: indexName,
          dimension: 1536,
          metadata_config: {
            indexed: ['chat_id'],
          },
        },
      });
      console.log(`Index created: ${newIndex}`);
    }
    // Get the index instance
    const pineconeIndex = pinecone.Index(indexName);
    // Upsert the batch of vectors
    const pineconeResult = await pineconeIndex.upsert({
      upsertRequest: {
        vectors: [
          {
            id: ObjectId, // mongodb chunk id
            values: embeddingArray,
            metadata: {
              chat_id: chatSessionId,
            },
          },
        ],
      },
    });
    console.log('All embeddings saved to Pinecone successfully.');
  } catch (error) {
    console.error('Error saving embeddings to Pinecone:', error);
  }
};
