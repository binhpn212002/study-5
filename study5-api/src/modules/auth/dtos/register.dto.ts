import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email!: string;

  @ApiProperty({ example: 'testuser' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(12)
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(12)
  password!: string;
}
