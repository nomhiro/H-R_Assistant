import { CosmosClient } from "@azure/cosmos";
import { AccountItem } from "../../models/models";

/**
 * categoryを全取得する
 * @returns - カテゴリの配列
 * */
export const getAllAccounts = async (): Promise<AccountItem[]> => {
  return new Promise(async (resolve, reject) => {
    const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME!);
    const container = database.container(process.env.COSMOS_ACCOUNT_CONTAINER_NAME!);

    try {
      const { resources } = await container.items.readAll<AccountItem>().fetchAll();
      resolve(resources);
    } catch (error) {
      console.error("🚀Error retrieving accounts:", error);
      reject(error);
    }
  });
};