import {
  CosmosClient,
  Database,
  Container,
} from "@azure/cosmos";

// ベクトル検索
export const getItemsByVector = async (embedding: number[]): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
      const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
      const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
      const container = database.container(process.env.COSMOS_CONTAINER_NAME!);
      const vectorScore = process.env.VECTOR_SCORE!;

      console.log('🚀Querying CosmosDB.');
      console.log(`🚀vectorScore: ${vectorScore}`);
      
      const { resources } = await container.items
          .query({
              query: `SELECT TOP 10 c.file_name, c.content, c.is_contain_image, c.image_blob_path, VectorDistance(c.content_vector, @embedding) AS SimilarityScore FROM c WHERE VectorDistance(c.content_vector, @embedding) > ${vectorScore} ORDER BY VectorDistance(c.content_vector, @embedding)`,
              parameters: [
                { name: "@embedding", value: embedding }
              ]
          })
          .fetchAll();
      for (const item of resources) {
          console.log(`🚀${item.file_name}, ${item.content}, ${item.image_blob_path}, ${item.SimilarityScore} is a capitol \n`);
      }
      resolve(resources);
  });
};