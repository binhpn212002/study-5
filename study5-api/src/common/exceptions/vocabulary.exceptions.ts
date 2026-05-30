import { ConflictException, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGE, ErrorCode } from '../constants/error-code.constant';

export class VocabularyNotFoundException extends NotFoundException {
  constructor(id?: string) {
    super({
      code: ErrorCode.VOCABULARY_NOT_FOUND,
      message: ERROR_MESSAGE[ErrorCode.VOCABULARY_NOT_FOUND],
      details: id ? { id } : undefined,
    });
  }
}

export class VocabularyChineseDuplicateException extends ConflictException {
  constructor(chinese: string) {
    super({
      code: ErrorCode.VOCABULARY_CHINESE_DUPLICATE,
      message: ERROR_MESSAGE[ErrorCode.VOCABULARY_CHINESE_DUPLICATE],
      details: { chinese },
    });
  }
}

export class VocabularyInvalidHskLevelException extends NotFoundException {
  constructor() {
    super({
      code: ErrorCode.VOCABULARY_INVALID_HSK_LEVEL,
      message: ERROR_MESSAGE[ErrorCode.VOCABULARY_INVALID_HSK_LEVEL],
    });
  }
}
