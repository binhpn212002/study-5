import { ConflictException, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGE, ErrorCode } from '../constants/error-code.constant';

export class SentenceNotFoundException extends NotFoundException {
  constructor(id?: string) {
    super({
      code: ErrorCode.SENTENCE_NOT_FOUND,
      message: ERROR_MESSAGE[ErrorCode.SENTENCE_NOT_FOUND],
      details: id ? { id } : undefined,
    });
  }
}

export class SentenceDuplicateException extends ConflictException {
  constructor(vietnamese: string, level: string) {
    super({
      code: ErrorCode.SENTENCE_DUPLICATE,
      message: ERROR_MESSAGE[ErrorCode.SENTENCE_DUPLICATE],
      details: { vietnamese, level },
    });
  }
}
