import { Column, Entity } from 'typeorm';
import { UserRole, UserStatus } from '../../common/constants/user.constant';
import { BaseEntity } from '../../shared/base.entity';

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 32, unique: true })
  phone: string;

  @Column({ name: "firebase_id", type: "varchar", length: 128, nullable: true })
  firebaseId: string | null;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  email: string;

  @Column({ name: "first_name", type: "varchar", length: 255, nullable: false })
  firstName: string;

  @Column({ name: "last_name", type: "varchar", length: 255, nullable: false })
  lastName: string;

  @Column({ name: "avatar_url", type: "varchar", length: 2048, nullable: true })
  avatarUrl: string | null;

  @Column({ type: "date", nullable: true })
  dob: string | null;

  @Column({ type: "varchar", length: 16 })
  status: UserStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  role: UserRole;
}
