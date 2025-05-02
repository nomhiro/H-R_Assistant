import { getEmbedding, getChatCompletions, getQueryJson } from './openai';
import { getItemsByVector } from './cosmos/document';
import { getBase64File } from './blob';
import { Query } from '../models/models';
import { CosmosInferenceItem } from "../models/models";
import { APIMessagesType } from "@/types/types";

export const getInferenceRAG = async (messages: APIMessagesType[], message: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      let VECTOR_SCORE = parseFloat(process.env.VECTOR_SCORE!);

      // ユーザメッセージを、Keywordと検索用文章に変換
      console.log('🚀Convert message to keyword and search sentence.');
      const query: Query = await getQueryJson(message);

      // ベクトル化
      console.log('🚀Get embedding from Azure OpenAI.');
      const embeddedMessage = await getEmbedding(query.search_text);

      let CosmosInferenceItems: CosmosInferenceItem[] = [];
      let attempts = 0;

      while (CosmosInferenceItems.length === 0 && attempts < 3) {
        // CosmosDBでベクトル検索
        console.log(`🚀Search vector from Azure CosmosDB with VECTOR_SCORE: ${VECTOR_SCORE}.`);
        CosmosInferenceItems = await getItemsByVector(embeddedMessage, VECTOR_SCORE.toString());

        if (CosmosInferenceItems.length === 0) {
          VECTOR_SCORE -= 0.03;
          attempts++;
          console.log(`🚀No items found. Retrying with VECTOR_SCORE: ${VECTOR_SCORE}. Attempt: ${attempts}`);
        }
      }

      if (CosmosInferenceItems.length === 0) {
        console.log('🚀No items found after 3 attempts.');
      }

      // systemMessageにRAGの情報を追加
      console.log('🚀Create system message and image_content.');
      let systemMessage = 'あなたは親切なアシスタントです。過去のチャット履歴と"検索結果" と画像の情報を使い回答しなさい。';
      systemMessage += '# 検索結果\n'
      let images: string[] = [];
      let responseImageUrl: string = "";
      for (const result of CosmosInferenceItems) {
        // ループ番号を追加
        systemMessage += '## ' + (CosmosInferenceItems.indexOf(result) + 1) + '\n' + result.content + '\n\n';;
        // 画像の取得
        if (result.is_contain_image === true) {
          const image = await getBase64File(result.image_blob_path);
          images.push(image);

          responseImageUrl += result.image_blob_path + ': ' + result.SimilarityScore + '  \n';
        }
      }

      // OpenAI へのリクエスト
      const result = await getChatCompletions(systemMessage, message, messages, images);
      let aiMessage = result[0].message.content;
      // 検索結果(cosmosItem)があればaiMessageと改行でつなぐ。スコアもつける
      let displaySearchedDoc = '';
      if (CosmosInferenceItems.length > 0) {
        displaySearchedDoc = '---\n### 検索結果\n';
        for (const item of CosmosInferenceItems) {
          displaySearchedDoc += (CosmosInferenceItems.indexOf(item) + 1) + '. ' + item.file_name + ' : ' + item.SimilarityScore + '\n';
        }
      }

      const resultMessage = aiMessage + '\n\n' + displaySearchedDoc;

      resolve(resultMessage);
    }
    catch (error: any) {
      console.error('  ❌Error in getOnYourData:', error);
      reject(error);
    }

  })
}
