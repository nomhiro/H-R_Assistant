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


def regist_context(azure_openai_service: AzureOpenAIService,
                   cosmos_service: CosmosService,
                   title: str,
                   context: str,):
    # contentをベクトル値に変換
    content_vector = azure_openai_service.getEmbedding(context)

    # CosmosDBに登録するアイテムのオブジェクト
    cosmos_page_obj = CosmosPageObj(file_name=title,
                                    file_path=None,
                                    page_number=None,
                                    content='# タイトル\n' + title + '\n' + context,
                                    content_vector=content_vector,
                                    keywords=None,
                                    delete_flag=False,
                                    is_contain_image=False,
                                    image_blob_path=None)

    cosmos_service.insert_data(cosmos_page_obj.to_dict())
