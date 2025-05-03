import { CosmosClient } from "@azure/cosmos";
import { CosmosInferenceItem, CosmosItem } from "../../models/models";

// ベクトル検索
export const getItemsByVector = async (embedding: number[], VECTOR_SCORE: string): Promise<CosmosInferenceItem[]> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CONTAINER_NAME!);

    console.log('🚀Querying CosmosDB.');
    console.log(`🚀vectorScore: ${VECTOR_SCORE}`);

    const { resources } = await container.items
      .query({
        query: `
          SELECT TOP 10 c.file_name, c.content, c.is_contain_image, c.image_blob_path, 
          c.category_id, VectorDistance(c.content_vector, @embedding) AS SimilarityScore 
          FROM c 
          WHERE VectorDistance(c.content_vector, @embedding) > ${VECTOR_SCORE} 
          ORDER BY VectorDistance(c.content_vector, @embedding)
        `,
        parameters: [
          { name: "@embedding", value: embedding }
        ]
      })
      .fetchAll();
    for (const item of resources) {
      console.log(`🚀${item.file_name}, ${item.content}, ${item.image_blob_path}, ${item.category_id}, ${item.SimilarityScore} is a capitol \n`);
    }
    resolve(resources);
  });
};

// データ登録
export const registerItem = async (item: CosmosItem): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CONTAINER_NAME!);

    try {
      await container.items.create(item);
      console.log("🚀Item registered successfully.");
      resolve();
    } catch (error) {
      console.error("🚀Error registering item:", error);
      reject(error);
    }
  });
};

// データ更新
export const updateItem = async (id: string, item: Partial<CosmosItem>): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CONTAINER_NAME!);

    try {
      const { resource } = await container.item(id, id).read();
      if (!resource) {
        console.log("🚀Item not found.");
        return reject(new Error("Item not found."));
      }

      const updatedItem = { ...resource, ...item }; // 既存データに新しいデータをマージ
      await container.item(id, id).replace(updatedItem);
      console.log("🚀Item updated successfully.");
      resolve();
    } catch (error) {
      console.error("🚀Error updating item:", error);
      reject(error);
    }
  });
};

// データ削除
export const deleteItem = async (id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CONTAINER_NAME!);

    try {
      // アイテムが存在するか確認
      const { resource } = await container.item(id, id).read();
      if (!resource) {
        console.log('🚀Item not found.');
        return reject(new Error('Item not found.'));
      }

      // アイテムを削除
      await container.item(id, id).delete();
      console.log('🚀Item deleted successfully.');
      resolve();
    } catch (error) {
      console.error('🚀Error deleting item:', error);
      reject(error);
    }
  });
};

/**
 * カテゴリIDに基づいてCosmosItemを取得する関数
 * @param categoryId - カテゴリID
 * @returns - CosmosItemの配列
 */
export const getCosmosItemsByCategoryId = async (categoryId: string): Promise<CosmosItem[]> => {
  const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
  const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
  const container = database.container(process.env.COSMOS_CONTAINER_NAME!);

  const query = {
    query: "SELECT * FROM c WHERE c.category_id = @categoryId",
    parameters: [{ name: "@categoryId", value: categoryId }],
  };

  const { resources } = await container.items.query<CosmosItem>(query).fetchAll();
  return resources;
};