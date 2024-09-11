import os
from azure.storage.blob import BlobServiceClient

BLOB_CONNECTION = os.getenv("BLOB_CONNECTION")
BLOB_CONTAINER_NAME = "rag-images"

blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION)

# Create a unique name for the container
container_name = BLOB_CONTAINER_NAME

file_name = "image.png"

# output/image.pngをアップロード
blob_client = blob_service_client.get_blob_client(container=container_name, blob="folder1/folder2"+file_name)
with open(f"output/{file_name}", "rb") as data:
    blob_client.upload_blob(data)
    
print("Upload image.png to blob storage")