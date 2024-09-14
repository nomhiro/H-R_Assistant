import pymupdf
import tempfile
import base64
import logging
from PIL import Image
from io import BytesIO

from urllib.parse import urlparse
from langchain_text_splitters import CharacterTextSplitter
from azure.storage.blob import BlobServiceClient

from domain.obj_cosmos_page import CosmosPageObj
from domain.document_structure import DocumentStructure
from service.openai_service.openai_service import AzureOpenAIService
from service.cosmos_service.cosmos_service import CosmosService

def regist_png(azure_openai_service: AzureOpenAIService, 
              cosmos_service: CosmosService, 
              blob_service_client: BlobServiceClient,
              data_as_file: BytesIO,
              STR_AI_SYSTEMMESSAGE: str,
              BLOB_CONTAINER_NAME_IMAGE: str,
              MAX_CONTENT_LENGTH: int,
              file_name: str,
              blob_url: str):
  
    # 画像ファイルをPIL Imageに変換
    img = Image.open(data_as_file)
    binary_data = BytesIO()
    img.save(binary_data, format='PNG')
    binary_data.seek(0)
    base64_data = base64.b64encode(binary_data.getvalue()).decode()
    
    # OpenAIに推論させるためのメッセージを作成
    image_content = []
    image_content.append({
        "type": "image_url",
        "image_url": 
        {
            "url": f"data:image/jpeg;base64,{base64_data}"
        },
    })
    messages = []
    messages.append({"role": "system", "content": STR_AI_SYSTEMMESSAGE})
    messages.append({"role": "user", "content": image_content})
    
    try:
        # GPT4oにはjsonフォーマット指定がないので使えない。
        response = azure_openai_service.getChatCompletionJsonStructuredMode(messages, 0, 0, DocumentStructure)
    except Exception as e:     
        # エラーが「Could not parse response content as the length limit was reached」の場合、そのページの処理をスキップする
        if "Could not parse response content as the length limit was reached" in str(e):
            logging.warning(f"🚀❌Error png gile '{file_name}': {e}")
            return
    
    # Check and truncate the response content if necessary
    doc_structured = response.choices[0].message.parsed

    logging.info(f"🚀Response Format: {doc_structured}")
    
    # contentをベクトル値に変換
    content_vector = azure_openai_service.getEmbedding(blob_url + '\n' + doc_structured.content)
    
    # is_contain_imageがTrueの場合は、StorageAccountのBlobの"rag-images"に画像をアップロード
    if doc_structured.is_contain_image:
        
        blob_client = blob_service_client.get_blob_client(container=BLOB_CONTAINER_NAME_IMAGE, blob=file_name)
        blob_client.upload_blob(base64.b64decode(base64_data), overwrite=True)
        logging.info(f"🚀Uploaded Image to Blob: {file_name}")
    
    # CosmosDBに登録するアイテムのオブジェクト
    cosmos_page_obj = CosmosPageObj(file_name=file_name,
                                    file_path=blob_url,
                                    page_number=0,
                                    content=doc_structured.content, 
                                    content_vector=content_vector,
                                    keywords=doc_structured.keywords,
                                    delete_flag=False,
                                    is_contain_image=doc_structured.is_contain_image,
                                    image_blob_path=file_name if doc_structured.is_contain_image else None)
    
    cosmos_service.insert_data(cosmos_page_obj.to_dict())