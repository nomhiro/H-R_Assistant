import { AzureOpenAI } from "openai";
import { Query } from "../models/models"

// export const getOnYourData = async (message: string): Promise<any[]> => {
//   console.log('start', process.env.AZURE_OPENAI_ENDPOINT!);
//   return new Promise(async (resolve, reject) => {
//     const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
//     const azureApiKey = process.env.AZURE_OPENAI_API_KEY!;
//     const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID!;
//     const content = `
//       ${message}
//       `;
//     try {
//       const messages = [
//         { role: 'system', content: 'You are a helpful assistant.' },
//         {
//           role: 'user',
//           content,
//         },
//       ];
//       const client = new OpenAIClient(
//         endpoint,
//         new AzureKeyCredential(azureApiKey)
//       );

//       const result = await client.getChatCompletions(deploymentId, messages);
//       resolve(result.choices);
//     } catch (error: any) {
//       reject(error);
//     }
//   });
// };

const apiVersion = "2024-10-21";

export const getChatCompletions = async (systemMessage: string, message: string, images: string[]): Promise<any[]> => {
  console.log('start', process.env.AZURE_OPENAI_ENDPOINT!);
  return new Promise(async (resolve, reject) => {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const apiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_ID!;
    // const content = `
    // ${message}
    // `;

    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      deployment,
      apiVersion
    });

    let messages;
    // もし画像があれば、画像も含めてメッセージを作成
    if (images.length > 0) {
      try {
        const response = await client.chat.completions.create({
          messages: [
            { role: 'system', content: systemMessage },
            {
              role: 'user', content: [
                {
                  type: "text",
                  text: message
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${images[0]}`
                  }
                }
              ]
            }
          ],
          model: deployment,
          max_tokens: 4096,
          stream: false
        });
        resolve(response.choices);
      } catch (error: any) {
        reject(error);
      }
    }
    // 画像がない場合
    else {
      try {
        const response = await client.chat.completions.create({
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: message }
          ],
          model: deployment,
          stream: false
        })
        resolve(response.choices);
      } catch (error: any) {
        reject(error);
      }
    }
  });
};

// 引数をベクトル化しベクトル値を返却する
// Azure OpenAIのembeddingモデルを使用し、ベクトル化を行う
export const getEmbedding = async (message: string): Promise<number[]> => {
  return new Promise(async (resolve, reject) => {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const apiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deployment = process.env.AZURE_OPENAI_VEC_DEPLOYMENT_ID!;

    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      deployment,
      apiVersion
    });
    const embeddings = await client.embeddings.create({ input: [message], model: deployment });

    resolve(embeddings.data[0].embedding);
  });
};

export const getQueryJson = async (input: string): Promise<Query> => {
  return new Promise(async (resolve, reject) => {
    console.log(` 🚀ユーザメッセージから検索クエリ生成開始: ${input}`)

    try {
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiKey = process.env.AZURE_OPENAI_API_KEY!;
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_ID!;

      const systemMessage = `ユーザ入力の文章を、重要なKeywordと、それに基づいた検索用文章に変換してください。

# Steps

1. ユーザメッセージを解析し、重要なキーワードを抽出する。
2. 抽出したキーワードを基に、簡潔な検索用文章を作成する。
3. キーワードと検索用文章をJSON形式で出力する。

# Output Format

以下の形式でJSON出力をしてください：
{
  "keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "search_text": "検索用に適した文章をここに記述"
}

# Examples

### Example 1:
**Input**
こんにちは！東京で最もおすすめのイタリアンレストランを教えてください。

**Output**
{
  "keywords": ["東京", "イタリアンレストラン", "おすすめ"],
  "search_text": "東京のおすすめイタリアンレストラン"
}

### Example 2:
**Input**
ありがとうございます。最近のAI技術の進化について知りたい。関係津に教えて。

**Output**
{
  "keywords": ["AI技術", "進化"],
  "search_text": "AI技術の進化に関する情報"
}

# Notes

- 抽出するキーワードは、文脈に沿った重要な単語を選択してください。
- **検索用文章**は、キーワードを自然な形で含む具体的で簡潔な文章にしてください。
- 不要な補助語や曖昧な表現は避けてください。`

      const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
      console.log("    url:", url);

      const headers = {
        "api-key": apiKey,
        "Content-Type": "application/json"
      };

      const body = {
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: input }
        ],
        temperature: 0.0,
        top_p: 0.0,
        max_tokens: 1024,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "Minutes",
            strict: true,
            schema: {
              type: "object",
              properties: {
                keywords: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                search_text: {
                  type: "string"
                }
              },
              required: [
                "keywords",
                "search_text"
              ],
              additionalProperties: false
            }
          }
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.statusText}`);
      }

      const responseData = await response.json();
      const query: Query = JSON.parse(responseData.choices[0].message.content);
      console.log("  🚀query:", query)

      resolve(query);
    } catch (error) {
      console.error("  ❌ユーザメッセージから検索クエリ生成エラー:", error);
      reject(error);
    }
  });
};