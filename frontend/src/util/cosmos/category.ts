import { CosmosClient } from "@azure/cosmos";
import { CategoryItem } from "../../models/models";

/**
 * categoryを全取得する
 * @returns - カテゴリの配列
 * */
export const getAllCategories = async (): Promise<CategoryItem[]> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CATEGORY_CONTAINER_NAME!);

    try {
      const { resources } = await container.items.readAll<CategoryItem>().fetchAll();
      console.log("🚀Categories retrieved successfully.");
      resolve(resources);
    } catch (error) {
      console.error("🚀Error retrieving categories:", error);
      reject(error);
    }
  });
};

/**
 * categoryを登録する
 * @param category - 登録するカテゴリ
 * @returns
 */
export const registerCategory = async (category: CategoryItem): Promise<CategoryItem> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CATEGORY_CONTAINER_NAME!);

    try {
      const { resource } = await container.items.create(category);
      console.log("🚀Category registered successfully.");
      resolve(resource as CategoryItem); // 登録したカテゴリを返す
    } catch (error) {
      console.error("🚀Error registering category:", error);
      reject(error);
    }
  });
};

/**
 * categoryを削除する
 * @param id - 削除するカテゴリのID
 * @returns 
 */
export const deleteCategoryById = async (id: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CATEGORY_CONTAINER_NAME!);

    try {
      const { resource } = await container.item(id, id).delete();
      console.log("🚀Category deleted successfully.");
      resolve(!!resource);
    } catch (error) {
      if ((error as any).code === 404) {
        console.log("🚀Category not found.");
        resolve(false);
      } else {
        console.error("🚀Error deleting category:", error);
        reject(error);
      }
    }
  });
};

/**
 * categoryを更新する
 * @param id - 更新するカテゴリのID
 * @param updates - 更新するカテゴリの内容
 * @returns 
 */
export const updateCategoryById = async (id: string, updates: Partial<CategoryItem>): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_CATEGORY_CONTAINER_NAME!);

    try {
      const { resource } = await container.item(id, id).read();
      if (!resource) {
        console.log("🚀Category not found.");
        resolve(false);
        return;
      }

      const updatedCategory = { ...resource, ...updates };
      await container.item(id, id).replace(updatedCategory);
      console.log("🚀Category updated successfully.");
      resolve(true);
    } catch (error) {
      if ((error as any).code === 404) {
        console.log("🚀Category not found.");
        resolve(false);
      } else {
        console.error("🚀Error updating category:", error);
        reject(error);
      }
    }
  });
};