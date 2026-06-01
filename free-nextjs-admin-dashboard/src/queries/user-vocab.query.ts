import { api } from '@/lib/axios';


export const userVocabQuery = {
  create: (vocabId: string, isSaved: boolean) =>
    api.post(`/user-vocab/save`, { vocabId, isSaved }).then((res) => res.data),

  saveMany: (vocabIds: string[], isSaved: boolean = true) =>
    api.post(`/user-vocab/save-many`, { vocabIds, isSaved }).then((res) => res.data),
};
