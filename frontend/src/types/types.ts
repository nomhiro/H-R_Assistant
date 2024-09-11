export type MessageType = {
  message: string;
  isMan: boolean;
};

export type ProjectCreateRequest = {
  name: string;
  description: string;
};

export type ProjectListInnerResponse = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type ProjectListResponse = {
  projects: ProjectListInnerResponse[];
  total_items: number;
  total_page: number;
  current_page: number;
};

export type GenerateAnswerRequest = {
  message: string;
};

export type GenerateAnswerResponse = {
  message: string;
};
