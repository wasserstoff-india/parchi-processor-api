import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { CHATAPI } from '../config/config.js';
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
// import Pinecone, { PineconeClient }  from '@pinecone-database/pinecone'
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import pkg from 'openai';
export const { OpenAIApi, ChatOpenAI, Configuration, LANGUAGES, FAISS } = pkg;

const pinecone = new PineconeClient();
await pinecone.init({
  environment: 'us-east-1-aws',
  apiKey: '31283199-8c91-49b6-9265-ea7d6a789a2b',
});

const indexName = 'parchii-wasserstoff'; // Set your desired index name

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

  console.log(splitter, '::::splitter');
  console.log(text.length);

  try {
    const fileDocs = await splitter.createDocuments([text]);

    console.log(fileDocs, '::::fileDocs');

    return fileDocs;
  } catch (error) {
    // Handle errors
    console.error('Error splitting text:', error);
    return null;
  }
};

export const CreatepdfAction = async (message, storedContent, text, id) => {
  console.log(id, ':::id');
  const chatSessionId = id.toString()
  console.log(chatSessionId,":::input string")
  const splitter = await TextSplitter(text);
  const concatenatedText = splitter.map((doc) => doc.pageContent).join(' ');
  try {
    const response = await openaiii.createEmbedding({
      model: 'text-embedding-ada-002',
      input: concatenatedText,
    });

    console.log(response.data?.data[0]?.embedding, ':::response');
    const embeddingArray = response.data?.data[0]?.embedding;
    await saveEmbeddingsToPinecone(embeddingArray, chatSessionId);
    await CreateUserEmbedding(message,chatSessionId);
  } catch (error) {
    // Handle errors
    console.error('Error creating embeddings:', error);
  }
};

export const saveEmbeddingsToPinecone = async (embeddingArray, chatSessionId) => {
  try {
    // Check if the index already exists
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.includes(indexName);

   

    // Create the index if it doesn't exist
    if (!indexExists) {
      const newIndex = await pinecone.createIndex({
        createRequest: {
          name: indexName,
          dimension: 1536,
          metadata_config : {
            "indexed": ["chat_id"]
        }
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
            id: chatSessionId, // mongodb id
            values: embeddingArray,
            metadata:{
              chat_id:chatSessionId
            }
          },
        ],
      },
    });

    console.log('Batch of embeddings saved to Pinecone:', pineconeResult);

    console.log('All embeddings saved to Pinecone successfully.');
  } catch (error) {
    console.error('Error saving embeddings to Pinecone:', error);
  }
};

export const CreateUserEmbedding = async (message,chatSessionId) => {
  console.log(message, '::message');
  try {
    const response = await openaiii.createEmbedding({
      model: 'text-embedding-ada-002',
      input: message,
    });

    console.log(response.data?.data[0]?.embedding, ':::response');
    const UserembeddingArray = response.data?.data[0]?.embedding;

    const pineconeIndex = pinecone.Index(indexName);

    const queryResponse = await pineconeIndex.query({
      queryRequest: {
        vector: UserembeddingArray,
        topK: 3,
        includeMetadata:true,
        filter:{
          chat_id:{"$eq":chatSessionId}
        }
      }
    })
    console.log(queryResponse,":::query response")

    return queryResponse;
  } catch (error) {
    // Handle errors
    console.error('Error creating embeddings:', error);
  }
};
