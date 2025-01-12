import { getEmbedding, getChatCompletions } from './openai'; 
import { getItemsByVector } from './cosmos';
import { getBase64File } from './blob';

export const getOnYourData = async (message: string): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    // ベクトル化
    console.log('🚀Get embedding from Azure OpenAI.');
    const embeddedMessage = await getEmbedding(message);

    // CosmosDBでベクトル検索
    console.log('🚀Search vector from Azure CosmosDB.');
    const cosmosItems = await getItemsByVector(embeddedMessage);

    // CosmosDBのベクトル検索で精度が出ない場合は、AISearchを使ったセマンティック検索などを使う　※仮実装
    // const searchResults = await searchHybrid(message, embeddedMessage);

    // systemMessageにRAGの情報を追加
    console.log('🚀Create system message and image_content.');
    let systemMessage = 'あなたが持っている知識は使ってはいけません。 "検索結果" と画像の情報のみを使い回答しなさい。わからない場合は「分かりません。」と回答しなさい。';
    systemMessage += '# 検索結果\n'
    let images: string[] = [];
    let responseImageUrl: string = "";
    for (const result of cosmosItems) {
      // ループ番号を追加
      systemMessage += '## ' + (cosmosItems.indexOf(result) + 1) + '\n' + result.content + '\n\n';;
      // 画像の取得
      if (result.is_contain_image === true) {
        const image = await getBase64File(result.image_blob_path);
        images.push(image);

        responseImageUrl += result.image_blob_path + ': ' + result.SimilarityScore + '  \n';
      }
    }

    // OpenAI へのリクエスト
    const result = await getChatCompletions(systemMessage, message, images);
    let aiMessage = result[0].message.content;
    // もしimageがあればaiMessageとresponseImageUrlを改行でつなぐ
    if (responseImageUrl !== "") {
      aiMessage += '  \n  \n' + "◆参考画像";
      aiMessage += '  \n' + responseImageUrl;
    }

    resolve(aiMessage);

  })
}
