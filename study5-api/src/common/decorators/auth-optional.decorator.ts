import { SetMetadata } from "@nestjs/common";

export const AUTH_OPTIONAL_KEY = "authOptional";

/** Đánh dấu route không cần JWT (dùng kèm `JwtAuthGuard` global hoặc để tài liệu rõ ý định). */
export const AuthOptional = () => SetMetadata(AUTH_OPTIONAL_KEY, true);
