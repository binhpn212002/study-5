import { HskLevel } from './vocabulary.query';
import { api } from '../lib/axios';

export interface SentenceResponse {
  id: string;
  vietnamese: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  hint: string | null;
  level: HskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSentenceResponse {
  data: SentenceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListSentenceParams {
  page?: number;
  limit?: number;
  q?: string;
  level?: HskLevel;
}

const buildParams = (params: Record<string, unknown> = {}): Record<string, string | number | undefined> => {
  const result: Record<string, string | number | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value as string | number;
    }
  }
  return result;
};

export const sentenceQuery = {
  list: (params: ListSentenceParams = {}) => {
    const query = buildParams({
      page: params.page,
      limit: params.limit,
      q: params.q,
      level: params.level,
    });
    return api.get<PaginatedSentenceResponse>('/sentences', { params: query }).then((res) => res.data);
  },

  getById: (id: string) =>
    api.get<SentenceResponse>(`/sentences/${id}`).then((res) => res.data),
};
