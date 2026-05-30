import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ErrorCode, ERROR_MESSAGE } from '../constants/error-code.constant';

export class UserVocabNotFoundException extends NotFoundException {
  constructor(vocabId?: string) {
    super({
      code: ErrorCode.USER_VOCAB_NOT_FOUND,
      message: ERROR_MESSAGE[ErrorCode.USER_VOCAB_NOT_FOUND],
      details: vocabId ? { vocabId } : undefined,
    });
  }
}

export class InvalidStatusTransitionException extends BadRequestException {
  constructor(currentStatus: string, newStatus: string) {
    super({
      code: ErrorCode.INVALID_STATUS_TRANSITION,
      message: ERROR_MESSAGE[ErrorCode.INVALID_STATUS_TRANSITION],
      details: { currentStatus, newStatus },
    });
  }
}
