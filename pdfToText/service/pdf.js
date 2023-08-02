import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { CHATAPI } from '../config/config.js';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
// import Pinecone, { PineconeClient }  from '@pinecone-database/pinecone'
import { PineconeClient } from '@pinecone-database/pinecone';
import pkg from 'openai';
export const { OpenAIApi, ChatOpenAI, Configuration, LANGUAGES, FAISS } = pkg;

export const conf = new Configuration({
  apiKey: CHATAPI,
});

const openaiii = new OpenAIApi(conf);

export const TextSplitter = async (text) => {
  const splitter = new CharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  console.log(splitter, '::::splitter');
  console.log(text.length);

  try {
    const fileDocs = await splitter.createDocuments([text], [], {
      chunkSize: 1000,
      appendChunkOverlapHeader: true,
    });

    console.log(fileDocs, '::::fileDocs');

    const textContent = fileDocs.map((doc) => doc.text).join(' ');

    return textContent;
  } catch (error) {
    // Handle errors
    console.error('Error splitting text:', error);
    return null;
  }
};
export const saveEmbeddingsToPinecone = async (embeddingArray, id) => {
  try {
    // Use the Pinecone client and initialize it with your API key and environment
    const pinecone = new PineconeClient();
    await pinecone.init({      
      environment: "us-west1-gcp-free",      
      apiKey: "4f1dc434-20da-4f1e-ac3c-a688b0250670",      
    });      
    const indexName = "parchi";
    const batchSize = 250; // Set the desired batch size

    // Create an array to store batches of vectors
    const batches = [];

    // Split the embeddingArray into batches
    for (let i = 0; i < embeddingArray.length; i += batchSize) {
      const batch = embeddingArray.slice(i, i + batchSize).map((embedding) => ({
        tag: id, // Use the provided id as the tag
        vector: embedding,
      }));
      batches.push(batch);
    }

    // Upsert each batch of vectors into the Pinecone index
    const pineconeIndex = pinecone.Index(indexName);
    for (const batch of batches) {
      await pineconeIndex.upsert({
        upsertRequest: {
          namespace: "parchi", // Replace with your desired namespace
          vectors: batch,
        },
      });
    }

    console.log("Embeddings saved to Pinecone successfully.");
  } catch (error) {
    console.error("Error saving embeddings to Pinecone:", error);
  }
};

export const CreatepdfAction = async (message, storedContent, text, id) => {
  console.log(id, ':::id');
  const splitter = await TextSplitter(text);
  console.log(splitter, ':splitter');
  try {
    const response = await openaiii.createEmbedding({
      model: 'text-embedding-ada-002',
      input: splitter, // Pass the array of strings here
    });

    console.log(response.data?.data[0]?.embedding, ':::response');
    const embeddingArray = response.data?.data[0]?.embedding;
    await saveEmbeddingsToPinecone(embeddingArray, id);

    return embeddingArray;
  } catch (error) {
    // Handle errors
    console.error('Error creating embeddings:', error);
  }
};
