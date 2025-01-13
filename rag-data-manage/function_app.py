import azure.functions as func
from openai import AzureOpenAI

import os
from io import BytesIO
import logging
import json

from azure.storage.blob import BlobServiceClient
from service.openai_service.openai_service import AzureOpenAIService
from service.cosmos_service.cosmos_service import CosmosService
from service.regist_pdf import regist_pdf
from service.regist_png import regist_png
from service.regist_context import regist_context

logging.basicConfig(level=logging.INFO)
app = func.FunctionApp()

STR_AI_SYSTEMMESSAGE = """
画像内の文字列をOCRし漏れなく出力しなさい。

##回答形式##
{
    "content":"画像の情報を漏れなく記載した文章。",
    "keywords": "カンマ区切りのキーワード群",
    "is_contain_image": "図や表などの画像で保存しておくべき情報が含まれている場合はtrue、それ以外はfalse"
}

##記載情報##
- content: 画像内の表は、Markdown形式で記載しなさい。
- keywords:  画像内の情報で重要なキーワードをkeywordsに記載してください。カンマ区切りで複数記載可能です。
- is_contain_image: 図や表などの画像で保存しておくべき情報が含まれている場合はtrue、それ以外はfalseを記載してください。
"""

BLOB_TRIGGER_PATH = "rag-docs"

BLOB_CONTAINER_NAME_IMAGE = "rag-images"
BLOB_CONNECTION = os.getenv("BLOB_CONNECTION")

# Define the maximum allowed length for the response content
MAX_CONTENT_LENGTH = 8192


aoai_client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-08-01-preview"
)
azure_openai_service = AzureOpenAIService(client=aoai_client)
cosmos_service = CosmosService()
blob_service_client = BlobServiceClient.from_connection_string(
    BLOB_CONNECTION
)


@app.event_grid_trigger(arg_name="azeventgrid")
def EventGridTrigger(azeventgrid: func.EventGridEvent):
    event = json.dumps({
        'id': azeventgrid.id,
        'data': azeventgrid.get_json(),
        'topic': azeventgrid.topic,
        'subject': azeventgrid.subject,
        'event_type': azeventgrid.event_type,
    })
    event_dict = json.loads(event)  # eventを辞書型に変換
    blob_url = event_dict.get("data").get("url")

    logging.info('🚀 Python EventGrid trigger processed an event')
    logging.info(f"🚀 azeventgrid.get_json() : {azeventgrid.get_json()}")

    try:
        # event_typeがMicrosoft.Storage.BlobCreatedの場合
        if event_dict.get("event_type") == "Microsoft.Storage.BlobCreated":

            logging.info(f"🚀Event Type: {event_dict.get('event_type')}")

            # Blobのファイルパスを取得
            blob_file_path = blob_url.split(f"{BLOB_TRIGGER_PATH}/")[1]
            logging.info(f"🚀Blob File Path: {blob_file_path}")
            blob_client = blob_service_client.get_blob_client(
                container=BLOB_TRIGGER_PATH, blob=blob_file_path)
            blob_data = blob_client.download_blob()
            logging.info(f"🚀Blob File downloaded.")

            # Blobからダウンロードしたファイルのファイル名と拡張子を取得
            file_name = blob_data.name
            file_extension = os.path.splitext(file_name)[1]

            logging.info(f"🚀Blob Data: {blob_data}")
            logging.info(f"🚀Blob Name: {file_name}")
            logging.info(f"🚀Blob Extension: {file_extension}")

            ragdocs = blob_data.content_as_bytes()
            data_as_file = BytesIO(ragdocs)

            # 同じfile_nameがCosmosDBに存在する場合は、そのアイテムを削除する
            query = f"SELECT * FROM c WHERE c.file_name = \"{file_name}\""
            items = cosmos_service.get_data(query)
            for item in items:
                # is_contain_imageがTrueの場合は、BlobのImageを削除
                # if item["is_contain_image"]:
                #     blob_client = blob_service_client.get_blob_client(container=BLOB_CONTAINER_NAME_IMAGE, blob=item["image_blob_path"])
                #     blob_client.delete_blob()
                #     logging.info(f"🚀Deleted Image from Blob: {item['image_blob_path']}")
                cosmos_service.delete_data(item["id"])
                logging.info(
                    f"🚀Deleted data from CosmosDB: {item['file_name']}, {item['page_number']}")

            if file_extension == ".pdf":

                logging.info("🚀Triggerd blob file is PDF.")

                regist_pdf(
                    azure_openai_service=azure_openai_service,
                    cosmos_service=cosmos_service,
                    blob_service_client=blob_service_client,
                    data_as_file=data_as_file,
                    STR_AI_SYSTEMMESSAGE=STR_AI_SYSTEMMESSAGE,
                    BLOB_CONTAINER_NAME_IMAGE=BLOB_CONTAINER_NAME_IMAGE,
                    MAX_CONTENT_LENGTH=MAX_CONTENT_LENGTH,
                    file_name=file_name,
                    blob_url=blob_url
                )

            elif file_extension == ".png" or file_extension == ".jpg" or file_extension == ".jpeg":

                logging.info("🚀Triggerd blob file is Image.")
                regist_png(
                    azure_openai_service=azure_openai_service,
                    cosmos_service=cosmos_service,
                    blob_service_client=blob_service_client,
                    data_as_file=data_as_file,
                    STR_AI_SYSTEMMESSAGE=STR_AI_SYSTEMMESSAGE,
                    BLOB_CONTAINER_NAME_IMAGE=BLOB_CONTAINER_NAME_IMAGE,
                    MAX_CONTENT_LENGTH=MAX_CONTENT_LENGTH,
                    file_name=file_name,
                    blob_url=blob_url
                )

            elif file_extension == ".txt" or file_extension == ".md":

                logging.info("🚀Triggerd blob file is Text.")
                regist_context(
                    azure_openai_service=azure_openai_service,
                    cosmos_service=cosmos_service,
                    file_name=file_name,
                    file_path=blob_url,
                    content=data_as_file.read().decode('utf-8'),
                    BLOB_NAME=BLOB_TRIGGER_PATH
                )

            else:
                # 対応していない拡張子なので、ログにWarningで出力
                logging.warning(
                    f"🚀❌Unsupported File Extension: \"{file_extension}\", File Name: \"{data_as_file.name}\"")

        elif event_dict.get("event_type") == "Microsoft.Storage.BlobDeleted":
            # Blobが削除された場合の処理
            logging.info(f"🚀Event Type: {event_dict.get('event_type')}")

            # blob_urlをCosmosのfile_pathで検索し、CosmosDBのアイテムを取得
            query = f"SELECT * FROM c WHERE c.file_path = \"{blob_url}\""
            items = cosmos_service.get_data(query)

            for item in items:
                # CosmosDBのアイテムを削除
                cosmos_service.delete_data(item["id"])
                logging.info(f"🚀Deleted data from CosmosDB: {item}")

                # PNGファイルをBlobに格納している場合は、BlobのImageを削除
                if item["is_contain_image"]:
                    blob_client = blob_service_client.get_blob_client(
                        container=BLOB_CONTAINER_NAME_IMAGE, blob=item["image_blob_path"])
                    blob_client.delete_blob()
                    logging.info(
                        f"🚀Deleted Image from Blob: {item['image_blob_path']}")

        else:
            # その他のイベントの場合
            logging.info(f"🚀Event Type: {event_dict.get('event_type')}")

    except Exception as e:
        logging.error(f"🚀❌Error at BlobTriggerEventGrid: {e}")
        raise e

# 文字列を受け取り、CosmosDBにdocとして登録する。
# Bodyのcontextに、登録対象の文字列が格納されている。Bodyのtitleに登録対象のタイトルが格納されている。


@app.function_name(name="upsertCosmosDoc")
@app.route(route="upsertCosmosDoc", auth_level=func.AuthLevel.ANONYMOUS)
def upsertCosmosDoc(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()

        if req_body.get("context") is None:
            return func.HttpResponse("Please pass a context in the request body.", status_code=400)
        else:
            context = req_body.get("context")

        if req_body.get("title") is None:
            return func.HttpResponse("Please pass a title in the request body.", status_code=400)
        else:
            title = req_body.get("title")

        regist_context(
            title=title,
            context=context,
            azure_openai_service=azure_openai_service,
            cosmos_service=cosmos_service
        )

        return func.HttpResponse(f"🚀Successfully registered content: {title}", status_code=200)

    except Exception as e:
        logging.error(f"🚀❌Error at upsertCosmosDoc: {e}")
        return func.HttpResponse(f"🚀❌Error at upsertCosmosDoc: {e}", status_code=500)
