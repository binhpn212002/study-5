export class AppException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppException';
  }
}

export enum ErrorCode {
  // Auth errors (1xxx)
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_NOT_FOUND = 'AUTH_002',
  TOKEN_EXPIRED = 'AUTH_003',
  TOKEN_INVALID = 'AUTH_004',

  // User errors (2xxx)
  USER_NOT_FOUND = 'USER_001',
  USER_ALREADY_EXISTS = 'USER_002',
  EMAIL_NOT_VERIFIED = 'USER_003',

  // Common errors (9xxx)
  INTERNAL_ERROR = 'SYS_001',
  BAD_REQUEST = 'SYS_002',
  NOT_FOUND = 'SYS_003',
  FORBIDDEN = 'SYS_004',
  CONFLICT = 'SYS_005',
  VALIDATION_ERROR = 'SYS_006',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Auth errors
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.TOKEN_NOT_FOUND]: 'Authentication token not found',
  [ErrorCode.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ErrorCode.TOKEN_INVALID]: 'Invalid authentication token',

  // User errors
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.USER_ALREADY_EXISTS]: 'User already exists',
  [ErrorCode.EMAIL_NOT_VERIFIED]: 'Email has not been verified',

  // Common errors
  [ErrorCode.INTERNAL_ERROR]: 'An internal error occurred',
  [ErrorCode.BAD_REQUEST]: 'Bad request',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.FORBIDDEN]: 'Access forbidden',
  [ErrorCode.CONFLICT]: 'Resource conflict',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
};

export const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  // Auth errors
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_NOT_FOUND]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,

  // User errors
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.USER_ALREADY_EXISTS]: 409,
  [ErrorCode.EMAIL_NOT_VERIFIED]: 403,

  // Common errors
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.VALIDATION_ERROR]: 400,
};
