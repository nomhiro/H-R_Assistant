import { AzureOpenAI } from "openai";
import { Query } from "../models/models"
import { APIMessagesType } from "@/types/types";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const deployment_1 = process.env.AZURE_OPENAI_DEPLOYMENT_1!;
const deployment_2 = process.env.AZURE_OPENAI_DEPLOYMENT_2!;
const vectorDeployment = process.env.AZURE_OPENAI_VEC_DEPLOYMENT_ID!;
const apiVersion = "2024-10-21";

export const getChatCompletions = async (system_message: string, message: string, messages?: APIMessagesType[], images?: string[]): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion
    });

    const createCompletion = async (deployment: string) => {
      let response;
      if ((images ?? []).length > 0) {
        response = await client.chat.completions.create({
          messages: [
            ...(messages ?? []),
            {
              role: 'system', content: system_message
            },
            {
              role: 'user', content: JSON.stringify([
                {
                  type: "text",
                  text: message
                },
                ...(images ?? []).map(imageUrl => ({
                  type: "image_url",
                  image_url: {
                    url: imageUrl
                  }
                }))
              ])
            }
          ],
          model: deployment,
          max_tokens: 4096,
          stream: false
        });
      } else {
        response = await client.chat.completions.create({
          messages: [
            ...(messages ?? []),
            {
              role: 'system', content: system_message
            },
            {
              role: 'user', content: message
            }
          ],
          model: deployment,
          max_tokens: 4096,
          stream: false
        });
      }
      return response;
    };

    try {
      console.log("  🚀Azure OpenAIへのリクエスト開始:", deployment_2);
      console.log("    system_message:", system_message);
      console.log("    message:", message);
      console.log("    messages:", messages);
      // 画像の数
      console.log("    images:", images?.length ?? 0);
      const response = await createCompletion(deployment_2);
      resolve(response.choices);
    } catch (error: any) {
      if (error.statusCode == 429) {
        console.error("  ❌レート制限エラーが発生しました。2番目のデプロイメントで推論します。");
        try {
          const response = await createCompletion(deployment_2);
          resolve(response.choices);
        } catch (error: any) {
          console.error("  ❌OpenAIへのリクエストエラー:", error);
          reject(error);
        }
      } else {
        console.error("  ❌OpenAIへのリクエストエラー:", error);
        reject(error);
      }
    }
  });
};

// 引数をベクトル化しベクトル値を返却する
// Azure OpenAIのembeddingモデルを使用し、ベクトル化を行う
export const getEmbedding = async (message: string): Promise<number[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const deployment = vectorDeployment;
      const client = new AzureOpenAI({
        endpoint,
        apiKey,
        deployment,
        apiVersion
      });
      const embeddings = await client.embeddings.create({ input: [message], model: deployment });
      resolve(embeddings.data[0].embedding);
    } catch (error) {
      console.error("  ❌ベクトル化エラー:", error);
      reject(error);
    }
  });
};

export const getQueryJson = async (input: string): Promise<Query> => {
  const createQueryJson = async (deployment: string): Promise<Query> => {
    console.log(` 🚀ユーザメッセージから検索クエリ生成開始: ${input}`)

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

    return query;
  };

  return new Promise(async (resolve, reject) => {
    try {
      const query = await createQueryJson(deployment_2);
      resolve(query);
    } catch (error: any) {
      if (error.statusCode === 429) {
        try {
          console.error("  ❌レート制限エラーが発生しました。2番目のデプロイメントで推論します。");
          const query = await createQueryJson(deployment_1);
          resolve(query);
        } catch (error: any) {
          console.error("  ❌ユーザメッセージから検索クエリ生成エラー:", error);
          reject(error);
        }
      } else {
        console.error("  ❌ユーザメッセージから検索クエリ生成エラー:", error);
        reject(error);
      }
    }
  });
};