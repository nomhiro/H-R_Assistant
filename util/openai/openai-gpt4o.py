import os
import logging

from openai import AzureOpenAI

logging.basicConfig(level=logging.INFO)

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")

logging.info(f'🚀🔑Azure OpenAI endpoint: {AZURE_OPENAI_ENDPOINT}')
logging.info(f'🚀🔑Azure OpenAI API key: {AZURE_OPENAI_API_KEY}')

client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_API_KEY,
    api_version="2024-03-01-preview"
)

try:
            
  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[
          {
              "role": "system",
              "content": "You are a helpful assistant."
          },
          {
              "role": "user",
              "content": "Json構造のサンプルを出力して"
          }
      ],
      response_format={ "type": "json_object" },
      max_tokens=4000,
      temperature=float(0),
      top_p=float(0)
  )

  logging.info(f'🚀✅Chat completion: {response.choices[0].message.content}')

except Exception as e:
    logging.error(f'🚀❌Error at getChatCompletion: {e}')
    raise e