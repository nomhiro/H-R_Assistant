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

def regist_pdf(azure_openai_service: AzureOpenAIService, 
                 cosmos_service: CosmosService, 
                 blob_service_client: BlobServiceClient,
                 data_as_file: BytesIO,
                 STR_AI_SYSTEMMESSAGE: str,
                 BLOB_CONTAINER_NAME_IMAGE: str,
                 MAX_CONTENT_LENGTH: int,
                 file_name: str,
                 blob_url: str):
    # Create a temporary file
    temp_path = ""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp:
        temp.write(data_as_file.read())
        temp_path = temp.name

    doc = pymupdf.open(temp_path)
    # ページ数をログに出力
    logging.info(f"🚀PDF Page count : {doc.page_count}")

    # ページごとにCosmosDBのアイテムを作成し、ページ画像がある場合はページの画像ファイルをBlobにを作成
    for page in doc:  # iterate through the pages
        logging.info(f"🚀Page Number: {page.number}")
        pix = page.get_pixmap()  # render page to an image
        # Convert the pixmap to a PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

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
                logging.warning(f"🚀❌Error page {page.number} of doc '{file_name}': {e}")
                continue
        
        # Check and truncate the response content if necessary
        doc_structured = response.choices[0].message.parsed
        if len(doc_structured.content) > MAX_CONTENT_LENGTH:
            logging.warning(f"Response content length ({len(doc_structured.content)}) exceeds the limit. Truncating to {MAX_CONTENT_LENGTH} characters.")
            doc_structured.content = doc_structured.content[:MAX_CONTENT_LENGTH]

        logging.info(f"🚀Response Format: {doc_structured}")
        
        # contentをベクトル値に変換
        # docu_structured.contentは8192トークン以内にする
        text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
            model_name="gpt-4", chunk_size=7000, chunk_overlap=0
        )
        spilitted_doc_structured = text_splitter.split_text(doc_structured.content)
        content_vector = azure_openai_service.getEmbedding(spilitted_doc_structured)
        
        # is_contain_imageがTrueの場合は、StorageAccountのBlobの"rag-images"に画像をアップロード
        if doc_structured.is_contain_image:
            # 格納するパスを生成。TriggerされたBlobのパスのフォルダとファイル名を、格納先フォルダにする。
            parsed_url = urlparse(blob_url)
            path_parts = parsed_url.path.split('/')
            index = path_parts.index('rag-docs')
            
            stored_image_path = file_name + "_page" + str(page.number) + ".png"
            
            blob_client = blob_service_client.get_blob_client(container=BLOB_CONTAINER_NAME_IMAGE, blob=stored_image_path)
            blob_client.upload_blob(base64.b64decode(base64_data), overwrite=True)
            logging.info(f"🚀Uploaded Image to Blob: {stored_image_path}")
        
        # CosmosDBに登録するアイテムのオブジェクト
        cosmos_page_obj = CosmosPageObj(file_name=file_name,
                                        file_path=blob_url,
                                        page_number=page.number,
                                        content=doc_structured.content, 
                                        content_vector=content_vector,
                                        keywords=doc_structured.keywords,
                                        delete_flag=False,
                                        is_contain_image=doc_structured.is_contain_image,
                                        image_blob_path=stored_image_path if doc_structured.is_contain_image else None)
        
        cosmos_service.insert_data(cosmos_page_obj.to_dict())
        
    # tempを削除
    temp.close()