import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import axios from 'axios';

export const getOnYourData = async (message: string): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const endpoint = process.env.AZURE_OPENAI_API_ENDPOINT!;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deploymentId = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME!;

      console.log('🚀 ~ On your data start ~ 🚀')

      const apiUrl = 'https://rag-app-webapp.azurewebsites.net/conversation';

      const requestData = {
        messages: [
          { role: 'user', content: message }
        ]
      };

      const res = await axios.post(apiUrl, requestData);
      console.log("🚀 ~ returnnewPromise ~ res:", res.data)

      const content = `
      # 質問
      ${message}
      # 回答
      ${res.data}

      - rule: 質問は表示せず、回答だけ表示して
      - rule: 日本の2024年1-3月の名目GDP成長率は0.1％（年率0.4％）です
      `;
      const messages: any[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content,
        },
      ];
      const client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(azureApiKey)
      );

      const result = await client.getChatCompletions(deploymentId, messages);
      resolve(result.choices);
  });
};
