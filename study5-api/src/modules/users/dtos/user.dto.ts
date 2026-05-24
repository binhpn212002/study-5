import { RoleEnum } from '../../../common/enums';
import { Expose } from 'class-transformer';
export class UserDto {
  @Expose()
  id!: number;
  @Expose()
  email!: string;
  username!: string;
  @Expose()
  firstName!: string;
  @Expose()
  lastName!: string;
  @Expose()
  role!: RoleEnum;
  @Expose()
  isActive!: boolean;
  @Expose()
  createdAt!: Date;
  @Expose()
  updatedAt!: Date;
}
