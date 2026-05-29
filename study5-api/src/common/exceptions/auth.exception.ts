import { ERROR_MESSAGES, ERROR_STATUS_CODES, ErrorCode } from '../constants';
import { AppException } from './base.exception';

export class UnauthorizedException extends AppException {
  constructor(code: ErrorCode = ErrorCode.INVALID_CREDENTIALS) {
    const message = ERROR_MESSAGES[code] || '';
    const statusCode = ERROR_STATUS_CODES[code] || 401;
    super(code, message, statusCode);
  }
}
