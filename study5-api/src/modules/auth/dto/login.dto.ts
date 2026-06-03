import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * Đăng nhập qua BE: Firebase Auth (Email/Password).
 * - `username` có thể là **email** (dùng trực tiếp với Firebase), hoặc **username** trong DB
 *   (khi đó cần có `users.email` khớp tài khoản Firebase Email/Password).
 */
export class LoginDto {
  @ApiProperty({
    description:
      "Tên đăng nhập trong WMS hoặc email đăng nhập Firebase (nếu là email)",
    example: "admin@gmail.com",
  })
  @IsEmail()
  @MaxLength(128)
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Mật khẩu đăng nhập",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(256)
  password: string;
}
