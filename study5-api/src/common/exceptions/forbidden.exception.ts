import { AppException } from './base.exception';
import { ErrorCode, ERROR_MESSAGES, ERROR_STATUS_CODES } from '../constants';

export class ForbiddenException extends AppException {
  constructor(code: ErrorCode = ErrorCode.FORBIDDEN) {
    const message = ERROR_MESSAGES[code] || '';
    const statusCode = ERROR_STATUS_CODES[code] || 403;
    super(code, message, statusCode);
  }
}
