export interface Query {
  keywords: string[];
  search_text: string;
}

export interface CosmosItem {
  file_name: string;
  content: string;
  is_contain_image: boolean;
  image_blob_path: string;
  SimilarityScore: number;
}