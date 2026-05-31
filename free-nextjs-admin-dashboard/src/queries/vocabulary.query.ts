import { api } from '../lib/axios';

/** HSK Level enum matching backend */
export enum HskLevel {
  HSK1 = 'HSK1',
  HSK2 = 'HSK2',
  HSK3 = 'HSK3',
  HSK4 = 'HSK4',
  HSK5 = 'HSK5',
  HSK6 = 'HSK6',
}

export interface VocabularyResponse {
  id: string;
  chinese: string;
  pinyin: string;
  vietnameseMeaning: string;
  exampleSentence: string | null;
  exampleMeaning: string | null;
  level: HskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVocabularyResponse {
  data: VocabularyResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HskLevelResponse {
  level: HskLevel;
  label: string;
  count: number;
}

export interface ListVocabularyParams {
  page?: number;
  limit?: number;
  q?: string;
  level?: HskLevel;
  fromDate?: string;
  toDate?: string;
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

export const vocabularyQuery = {
  list: (params: ListVocabularyParams = {}) => {
    const query = buildParams({
      page: params.page,
      limit: params.limit,
      q: params.q,
      level: params.level,
      fromDate: params.fromDate,
      toDate: params.toDate,
    });
    return api.get<PaginatedVocabularyResponse>('/vocabularies', { params: query }).then((res) => res.data);
  },

  getLevels: () =>
    api.get<HskLevelResponse[]>('/vocabularies/levels').then((res) => res.data),

  getByLevel: (level: HskLevel) =>
    api.get<VocabularyResponse[]>(`/vocabularies/by-level/${level}`).then((res) => res.data),

  findOne: (id: string) =>
    api.get<VocabularyResponse>(`/vocabularies/${id}`).then((res) => res.data),
};
