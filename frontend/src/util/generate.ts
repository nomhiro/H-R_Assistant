import { getEmbedding, getChatCompletions, getQueryJson } from './openai';
import { getItemsByVector } from './cosmos';
import { getBase64File } from './blob';
import { Query } from '../models/models';

export const getOnYourData = async (message: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // ユーザメッセージを、Keywordと検索用文章に変換
      console.log('🚀Convert message to keyword and search sentence.');
      const query: Query = await getQueryJson(message);

      // ベクトル化
      console.log('🚀Get embedding from Azure OpenAI.');
      const embeddedMessage = await getEmbedding(query.search_text);

      // CosmosDBでベクトル検索
      console.log('🚀Search vector from Azure CosmosDB.');
      const cosmosItems = await getItemsByVector(embeddedMessage, query.keywords);

      // CosmosDBのベクトル検索で精度が出ない場合は、AISearchを使ったセマンティック検索などを使う　※仮実装
      // const searchResults = await searchHybrid(message, embeddedMessage);

      // systemMessageにRAGの情報を追加
      console.log('🚀Create system message and image_content.');
      let systemMessage = 'あなたが持っている知識は使ってはいけません。 "検索結果" と画像の情報のみを使い回答しなさい。わからない場合は「分かりません。」と回答しなさい。\nスコアが高い検索結果を優先的に使い、推論してください。';
      systemMessage += '# 検索結果\n'
      const images: string[] = [];
      // let responseImageUrl: string = "";
      for (const result of cosmosItems) {
        // ループ番号を追加
        systemMessage += '◆ ' + (cosmosItems.indexOf(result) + 1) + ' スコア：' + result.SimilarityScore + '\n' + result.content + '\n\n';
        // 画像の取得
        if (result.is_contain_image === true) {
          const image = await getBase64File(result.image_blob_path);
          images.push(image);

          // responseImageUrl += result.image_blob_path + ': ' + result.SimilarityScore + '  \n';
        }
      }
      console.log(' 🚀systemMessage: ' + systemMessage)

      // OpenAI へのリクエスト
      const result = await getChatCompletions(systemMessage, message, images);
      let aiMessage = result[0].message.content;
      // 検索結果(cosmosItem)があればaiMessageと改行でつなぐ。スコアもつける\
      let displaySearchedDoc = '';
      if (cosmosItems.length > 0) {
        displaySearchedDoc = '---\n### 検索結果\n';
        for (const item of cosmosItems) {
          displaySearchedDoc += (cosmosItems.indexOf(item) + 1) + '. ' + item.file_name + ' : ' + item.SimilarityScore + '\n';
        }
      }

      const resultMessage = aiMessage + '\n\n' + displaySearchedDoc;

      resolve(resultMessage);

    } catch (error: any) {
      console.error('  ❌Error in getOnYourData:', error);
      reject(error);
    }
  });
}
