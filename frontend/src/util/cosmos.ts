import {
  CosmosClient
} from "@azure/cosmos";
import { CosmosItem } from "../models/models";

// ベクトル検索
export const getItemsByVector = async (embedding: number[], keywords: string[]): Promise<CosmosItem[]> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CONTAINER_NAME!);
    const vectorScore = process.env.VECTOR_SCORE!;

    console.log('🚀Querying CosmosDB.');
    console.log(`🚀vectorScore: ${vectorScore}`);

    const keywordConditions = keywords.map((keyword, index) => `ARRAY_CONTAINS(c.keywords, @keyword${index})`).join(' OR ');
    const keywordParameters = keywords.map((keyword, index) => ({ name: `@keyword${index}`, value: keyword }));

    try {
      const { resources } = await container.items
        .query({
          query: `SELECT TOP 10 c.file_name, c.content, c.is_contain_image, c.image_blob_path, VectorDistance(c.content_vector, @embedding) AS SimilarityScore FROM c WHERE (${keywordConditions}) AND VectorDistance(c.content_vector, @embedding) > ${vectorScore} ORDER BY VectorDistance(c.content_vector, @embedding)`,
          parameters: [
            { name: "@embedding", value: embedding },
            ...keywordParameters
          ]
        })
        .fetchAll();
      resolve(resources);
    } catch (error) {
      console.error('❌Error querying CosmosDB.', error);
      reject(error);
    }
  });
};