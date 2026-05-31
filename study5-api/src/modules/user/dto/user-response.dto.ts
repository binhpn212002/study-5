import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../common/constants/user.constant';
import { User } from '../../../database/entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  email: string | null;

  @ApiPropertyOptional()
  fullName: string | null;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiPropertyOptional()
  dob: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;
  @ApiProperty({ enum: UserStatus })
  isActive: boolean;
  @ApiProperty({ enum: UserRole })
  role: UserRole;
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.phone = user.phone;
    dto.email = user.email;
    dto.fullName = user.fullName;
    dto.avatarUrl = user.avatarUrl;
    dto.dob = user.dob;
    dto.status = user.status as UserStatus;
    dto.isActive = user.status === UserStatus.ACTIVE;
    dto.role = user.role as UserRole;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
