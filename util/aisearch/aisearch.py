# Azure AI Search
# create index
# under is fields.
## id
## keywords
## content
## vector

from azure.identity import DefaultAzureCredential
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SimpleField,
    SearchFieldDataType,
    SearchableField,
    SearchField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    SemanticConfiguration,
    SemanticPrioritizedFields,
    SemanticField,
    SemanticSearch,
    SearchIndex,
    AzureOpenAIVectorizer,
    AzureOpenAIParameters
)
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from openai import AzureOpenAI
import os
import logging
import json

logging.basicConfig(level=logging.INFO)

endpoint = os.getenv("AISEARCH_ENDPOINT")
credential = AzureKeyCredential(os.getenv("AISEARCH_KEY"))
index_name = "rag-index-001"

azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
azure_openai_key = os.getenv("AZURE_OPENAI_KEY") if len(os.getenv("AZURE_OPENAI_KEY")) > 0 else None
azure_openai_embedding_deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT")
azure_openai_api_version = "2024-02-01"
# azure_openai_chatgpt_deployment = os.environ["AZURE_OPENAI_CHATGPT_DEPLOYMENT"]

# AISearchのIndexを作成
index_client = SearchIndexClient(endpoint=endpoint, credential=credential)
# OpenAIのclientを作成
aoai_client = AzureOpenAI(
    api_version=azure_openai_api_version,
    azure_endpoint=azure_openai_endpoint,
    api_key=azure_openai_key
)

def create_index():
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True, sortable=True, filterable=True, facetable=True),
        # SimpleField(name="cosmos_id", type=SearchFieldDataType.String),
        # SimpleField(name="cosmos_ids", type=SearchFieldDataType.Collection(SearchFieldDataType.String)),
        SearchableField(name="file_name", type=SearchFieldDataType.String),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SearchableField(name="keywords", type=SearchFieldDataType.String),
        SearchableField(name="file_path", type=SearchFieldDataType.String),
        SearchField(name="file_name_vector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                    searchable=True, vector_search_dimensions=1536, vector_search_profile_name="myHnswProfile"),
        SearchField(name="content_vector", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                    searchable=True, vector_search_dimensions=1536, vector_search_profile_name="myHnswProfile"),
    ]
    # ベクトル検索の設定
    vector_search = VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(
                name="myHnsw"
            )
        ],
        profiles=[
            VectorSearchProfile(
                name="myHnswProfile",
                algorithm_configuration_name="myHnsw"
            )
        ]
    )

    # セマンティック検索の設定
    semantic_config = SemanticConfiguration(
        name="my-semantic-config",
        prioritized_fields=SemanticPrioritizedFields(
            content_fields=[SemanticField(field_name="file_name"), SemanticField(field_name="content")],
        )
    )

    # セマンティック検索設定を作成
    semantic_search = SemanticSearch(configurations=[semantic_config])

    # インデックスを作成
    index = SearchIndex(name=index_name, fields=fields,
                        vector_search=vector_search, semantic_search=semantic_search)

    result = index_client.create_or_update_index(index)
    print(f'{result.name} created')


def upload_doc():
    # output_path = os.path.join('..', 'output', 'docVectors.json')
    
    cosmos_ids = ["1","2","3"]
    file_name = "GPT-4o.txt"
    content = """5月13日（米国時間）に米OpenAIが発表した、生成AI「GPT」シリーズの新たなモデル「GPT-4o」。クラウドサービス「Microsoft Azure」を使い、API経由でGPTシリーズにアクセスできる「Azure OpenAI Service」でも、すでに試用可能となっている。
ビュー版として米国リージョンの一部でGPT-4oを提供。Web開発環境「Azure OpenAI Studio」で機能を試すことができ、現時点でテキスト・画像の入力に対応。動画や音声の入力機能は今後追加するという。"""
    keywords = "GPT-4o,OpenAI,Azure OpenAI Service,Azure OpenAI Studio"
    file_path = "/path/GPT-4o.txt"
    
    file_name_response = aoai_client.embeddings.create(input=file_name, model=azure_openai_embedding_deployment)
    content_response = aoai_client.embeddings.create(input=content, model=azure_openai_embedding_deployment)
    
    file_name_vector = file_name_response.data[0].embedding
    content_vector = content_response.data[0].embedding

    document = {
        "id": "1",
        # "cosmos_id": "1000",
        # "cosmos_ids": ["1000", "1001", "1002"],
        "file_name": file_name,
        "content": content,
        "keywords": keywords,
        "file_path": file_path,
        "file_name_vector": file_name_vector,
        "content_vector": content_vector
    }
    
    search_client = SearchClient(endpoint=endpoint, index_name=index_name, credential=credential)
    result = search_client.merge_or_upload_documents(document)
    print(f"Uploaded {len(document)} documents") 


# セマンティックハイブリッド検索
def hybrid_search(search_client: SearchClient, query: str) -> list:
    
    embedding = aoai_client.embeddings.create(input=query, model=azure_openai_embedding_deployment).data[0].embedding
    
    results = search_client.search(
        query_type="semantic",
        search_text=query,
        vector_queries=[VectorizedQuery(vector=embedding, k_nearest_neighbors=3, fields="content_vector")],
        top=3,
        select="id, file_name, content, file_path",
        search_fields=["file_name", "content"],
        semantic_configuration_name="my-semantic-config"
    )
    data = [[result["id"], result["file_name"], result["content"], result["file_path"], result["@search.score"]] for result in results]
    return data



create_index()

# upload_doc()

# search_client = SearchClient(endpoint=endpoint, index_name=index_name, credential=credential)
# search_results = hybrid_search(search_client, "サンプル")
# logging.info(f"🚀 search_results: {search_results}")