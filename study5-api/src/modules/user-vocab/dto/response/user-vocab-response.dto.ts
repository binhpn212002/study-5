import { VocabStatus } from '../../../../common/constants/vocab-status.constant';
import { HskLevel } from '../../../../common/constants/vocabulary.constant';

export class UserVocabResponseDto {
  id: string;
  vocabId: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  level: string;
  isSaved: boolean;
  status: VocabStatus;
  savedAt: Date;
}

export class UserVocabListResponseDto {
  items: UserVocabResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}
