import {
  GenerateAnswerRequest,
  GenerateAnswerResponse,
  ProjectCreateRequest,
  ProjectListResponse,
} from '@/types/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const projectSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_RAG_EXTRA2_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectListResponse, void>({
      query: () => 'api/projects',
    }),
    postProject: builder.mutation({
      query: (payload: ProjectCreateRequest) => ({
        url: 'api/projects',
        method: 'POST',
        body: payload,
      }),
    }),
    postMessage: builder.mutation<
      GenerateAnswerResponse,
      { projectId: string; body: GenerateAnswerRequest }
    >({
      query: (payload: { projectId: string; body: GenerateAnswerRequest }) => ({
        url: `api/projects/${payload.projectId}/chats`,
        method: 'POST',
        body: payload.body,
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  usePostProjectMutation,
  usePostMessageMutation,
} = projectSlice;
