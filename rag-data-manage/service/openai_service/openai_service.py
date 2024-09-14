import logging
import os
from openai import AzureOpenAI
from pydantic import BaseModel
 
class AzureOpenAIService:
    
    # AzureOpenAI clientを引数指定する
    def __init__(self, client: AzureOpenAI) -> None:
        self.client = client

    def getChatCompletion(self, messages, temperature, top_p):
        try:
            
            response = self.client.chat.completions.create(
                model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"),
                messages=messages,
                temperature=float(temperature),
                top_p=float(top_p)
            )

            return response
        except Exception as e:
            logging.error(f'🚀❌Error at getChatCompletion: {e}')
            raise e
    
    def getChatCompletionJsonStructuredMode(self, messages, temperature, top_p, structure):
        try:
            
            response = self.client.beta.chat.completions.parse( 
                model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"),
                messages=messages,
                response_format=structure,
                temperature=float(temperature),
                top_p=float(top_p)
            )

            return response
        
        except Exception as e:
            logging.error(f'🚀❌Error at getChatCompletion: {e}')        
            # エラーが「Could not parse response content as the length limit was reached」の場合、本関数をリトライする
            if "Could not parse response content as the length limit was reached" in str(e):
                return self.getChatCompletionJsonStructuredMode(messages, temperature, top_p, structure)
    
    def getEmbedding(self, input):
        try:
            response = self.client.embeddings.create(
                input=input,
                model=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME")
            )
            return response.data[0].embedding
        except Exception as e:
            logging.error(f'🚀❌Error at getEmbedding: {e}')
            raise e