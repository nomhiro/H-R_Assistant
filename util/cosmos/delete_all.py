# CosmosDBのdoc-dbデータベース内のdoc-container内の全アイテムを削除する

import os
import logging

import azure.cosmos.cosmos_client as CosmosClient

logging.basicConfig(level=logging.INFO)

COSMOSDB_URI = os.getenv('COSMOSDB_URI')
COSMOSDB_KEY = os.getenv('COSMOSDB_KEY')
DATABASE_NAME = os.getenv('COSMOSDB_DATABASE_NAME')
CONTAINER_NAME = os.getenv('COSMOSDB_CONTAINER_NAME')

client = CosmosClient.CosmosClient(COSMOSDB_URI, {'masterKey': COSMOSDB_KEY})
database = client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)
logging.info(f"Connected to CosmosDB: {COSMOSDB_URI}")

# すべてのアイテムを取得し、削除する
items = list(container.read_all_items())
for item in items:
    container.delete_item(item['id'], item['id'])
    logging.info(f"Deleted item: {item['id'], item['file_name'], item['page_number']}")