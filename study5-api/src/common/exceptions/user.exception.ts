import { AppException } from './base.exception';
import { ErrorCode, ERROR_MESSAGES, ERROR_STATUS_CODES } from '../constants';

export class UserNotFoundException extends AppException {
  constructor(code: ErrorCode = ErrorCode.USER_NOT_FOUND) {
    const message = ERROR_MESSAGES[code] || '';
    const statusCode = ERROR_STATUS_CODES[code] || 404;
    super(code, message, statusCode);
  }
}

export class UserAlreadyExistsException extends AppException {
  constructor(code: ErrorCode = ErrorCode.USER_ALREADY_EXISTS) {
    const message = ERROR_MESSAGES[code] || '';
    const statusCode = ERROR_STATUS_CODES[code] || 409;
    super(code, message, statusCode);
  }
}

export class EmailNotVerifiedException extends AppException {
  constructor(code: ErrorCode = ErrorCode.EMAIL_NOT_VERIFIED) {
    const message = ERROR_MESSAGES[code] || '';
    const statusCode = ERROR_STATUS_CODES[code] || 403;
    super(code, message, statusCode);
  }
}
