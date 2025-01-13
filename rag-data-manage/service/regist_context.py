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
from util.gen_keywords import extract_keywords_from_file_path


def regist_context(azure_openai_service: AzureOpenAIService,
                   cosmos_service: CosmosService,
                   file_name: str,
                   file_path: str,
                   content: str,
                   BLOB_NAME: str):

    # ファイル名をタイトルとして、コンテンツをMarkdown形式に変換
    content = '# ' + file_name + '\n\n' + content,

    # contentをベクトル値に変換
    content_vector = azure_openai_service.getEmbedding(content)

    keywords = extract_keywords_from_file_path(file_path, BLOB_NAME)

    # CosmosDBに登録するアイテムのオブジェクト
    cosmos_page_obj = CosmosPageObj(file_name=file_name,
                                    file_path=file_path,
                                    page_number=None,
                                    content=content,
                                    content_vector=content_vector,
                                    keywords=keywords,
                                    delete_flag=False,
                                    is_contain_image=False,
                                    image_blob_path=None)

    cosmos_service.insert_data(cosmos_page_obj.to_dict())
