export interface Query {
  keywords: string[];
  search_text: string;
}

// 推論時にベクトル検索で取得するCosmosDBのアイテム
export interface CosmosInferenceItem {
  category_id?: string; // カテゴリID (オプショナル)
  file_name: string;
  content: string;
  is_contain_image: boolean;
  image_blob_path: string;
  SimilarityScore: number;
}

// ナレッジデータとしてCosmosDBに登録する
export interface CosmosItem {
  id: string;
  category_id?: string; // カテゴリID (オプショナル)
  page_number: number;
  content: string;
  content_vector: number[];
  keywords: string[];
  file_name: string;
  file_path: string;
  is_contain_image: boolean;
  image_blob_path: string;
}

// カテゴリアイテム
export interface CategoryItem {
  id: string;
  category: string;  // PartitionKey
  order: number;
}