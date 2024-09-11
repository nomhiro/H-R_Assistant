# CosmosDBのdoc-dbデータベース内のdoc-container内の全アイテムの"delete_flag"をTrueにする

import os
import logging

import azure.cosmos.cosmos_client as CosmosClient

COSMOSDB_URI = os.getenv('COSMOSDB_URI')
COSMOSDB_KEY = os.getenv('COSMOSDB_KEY')
DATABASE_NAME = os.getenv('COSMOSDB_DATABASE_NAME')
CONTAINER_NAME = os.getenv('COSMOSDB_CONTAINER_NAME')

client = CosmosClient.CosmosClient(COSMOSDB_URI, {'masterKey': COSMOSDB_KEY})
database = client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)
logging.info(f"Connected to CosmosDB: {COSMOSDB_URI}")

# SQLクエリを実行して、全アイテムの"delete_flag"をTrueにする
query = "SELECT * FROM c"
items = list(container.query_items(query=query, enable_cross_partition_query=True))
for item in items:
    item["delete_flag"] = True
    container.upsert_item(item)

logging.info(f"Soft-deleted {len(items)} items")