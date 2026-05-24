import { AppException } from './base.exception';
import { ErrorCode, ERROR_MESSAGES, ERROR_STATUS_CODES } from '../constants';

export class UnauthorizedException extends AppException {
  constructor(code: ErrorCode = ErrorCode.INVALID_CREDENTIALS) {
    const message = ERROR_MESSAGES[code] || '';
    const statusCode = ERROR_STATUS_CODES[code] || 401;
    super(code, message, statusCode);
  }
}
