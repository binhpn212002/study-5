import { Injectable } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { UserRole, UserStatus } from '../../../common/constants/user.constant';
import { ListResponseDto } from '../../../common/dto/list-response.dto';
import { AuthInvalidCredentialsException } from '../../../common/exceptions/auth.exceptions';
import {
    UserFirebaseIdDuplicateException,
    UserNotFoundException,
    UserPhoneDuplicateException,
    UserUsernameDuplicateException
} from '../../../common/exceptions/user.exceptions';
import { AuthUser } from '../../../common/interfaces/auth-user.interface';
import { normalizePhoneDigitsForCompare } from '../../../common/utils/phone-normalize.util';
import { User } from '../../../database/entities/user.entity';
import { FirebaseAdminService } from '../../auth/services/firebase-admin.service';
import { AssignUserRolesDto } from '../dto/assign-user-roles.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly firebaseService: FirebaseAdminService,
  ) {}

  async getAuthUser(userId: string): Promise<AuthUser | null> {
    const user = await this.usersRepo.findByIdWithRoles(userId);
    if (!user) {
      return null;
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new AuthInvalidCredentialsException();
    }
    return {
      userId: user.id,
      role: user.role ?? "",
      email: user.email ?? "",
    };
  }

  /**
   * Email dùng với Firebase `signInWithPassword`:
   * - `username` dạng email → dùng trực tiếp;
   * - ngược lại → lấy `users.email` (bắt buộc có) của user theo username.
   */
  async resolveEmailForPasswordLogin(email: string): Promise<string> {
    const user = await this.usersRepo.findByEmail(email);

    console.log(user);
    if (!user) {
      throw new AuthInvalidCredentialsException();
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new AuthInvalidCredentialsException();
    }
    return user.email?.trim() ?? "";
  }

  /**
   * Đăng nhập Firebase: tìm theo UID; nếu chưa có — thử gán `firebase_id` khi SĐT hoặc email
   * trong token khớp user (chưa có UID).
   */
  async resolveUserForFirebaseLogin(
    firebaseUid: string,
    decoded: DecodedIdToken,
  ): Promise<User> {
    const byUid = await this.usersRepo.findByFirebaseId(firebaseUid);
    if (byUid) {
      if (byUid.status === UserStatus.INACTIVE) {
        throw new AuthInvalidCredentialsException();
      }
      return byUid;
    }
    const linked = await this.tryLinkFirebaseUser(firebaseUid, decoded);
    if (linked) {
      if (linked.status === UserStatus.INACTIVE) {
        throw new AuthInvalidCredentialsException();
      }
      return linked;
    }
    throw new AuthInvalidCredentialsException();
  }

  private async tryLinkFirebaseUser(
    firebaseUid: string,
    decoded: DecodedIdToken,
  ): Promise<User | null> {
    const phoneClaim = decoded.phone_number;
    const emailClaim = decoded.email?.toLowerCase()?.trim();

    if (!phoneClaim && !emailClaim) {
      return null;
    }

    const phoneKey = phoneClaim
      ? normalizePhoneDigitsForCompare(phoneClaim)
      : null;

    const candidates =
      await this.usersRepo.findAllWithFirebaseIdNullWithRoles();

    for (const u of candidates) {
      const phoneMatch =
        phoneKey !== null &&
        normalizePhoneDigitsForCompare(u.phone) === phoneKey;
      const emailMatch =
        !!emailClaim &&
        !!u.email &&
        u.email.toLowerCase().trim() === emailClaim;

      if (!phoneMatch && !emailMatch) {
        continue;
      }

      if (await this.usersRepo.existsFirebaseId(firebaseUid)) {
        return null;
      }

      u.firebaseId = firebaseUid;
      await this.usersRepo.save(u);
      return (await this.usersRepo.findByFirebaseId(firebaseUid))!;
    }

    return null;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const username = dto.email.trim();
    const phone = dto.phone.trim();
    if (await this.usersRepo.existsUsername(username)) {
      throw new UserUsernameDuplicateException();
    }
    if (await this.usersRepo.existsPhone(phone)) {
      throw new UserPhoneDuplicateException();
    }

    // register new user to firebase with email and password is phone
    const firebaseId = await this.firebaseService.createUser(
      phone,
      dto.email ?? "",
      phone,
    );
    const user = this.usersRepo.create({
      phone,
      firebaseId,
      email: dto.email ?? null,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      status: UserStatus.ACTIVE,
      avatarUrl: null,
      dob: null,
    });

    await this.usersRepo.save(user);

    const full = await this.usersRepo.findByIdWithRoles(user.id);
    return UserResponseDto.fromEntity(full!);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepo.findByIdWithRoles(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return UserResponseDto.fromEntity(user);
  }

  async list(
    query: ListUsersQueryDto,
  ): Promise<ListResponseDto<UserResponseDto>> {
    query.normalize();
    const res = await this.usersRepo.findManyWithFilters(query);
    const data = res.data.map((u) => UserResponseDto.fromEntity(u));
    return ListResponseDto.create(data, res.total, res.page, res.limit);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.dob !== undefined) user.dob = dto.dob;
    await this.usersRepo.save(user);
    const full = await this.usersRepo.findByIdWithRoles(user.id);
    return UserResponseDto.fromEntity(full!);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.status !== undefined) user.status = dto.status;
    if (dto.firebaseId !== undefined) {
      const fid =
        dto.firebaseId === null || dto.firebaseId === ""
          ? null
          : dto.firebaseId.trim();
      if (fid && (await this.usersRepo.existsFirebaseId(fid, id))) {
        throw new UserFirebaseIdDuplicateException();
      }
      user.firebaseId = fid;
    }
    await this.usersRepo.save(user);
    const full = await this.usersRepo.findByIdWithRoles(user.id);
    return UserResponseDto.fromEntity(full!);
  }

  async assignRoles(
    id: string,
    dto: AssignUserRolesDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    user.role = dto.role as UserRole;
    await this.usersRepo.save(user);
    return UserResponseDto.fromEntity(user);
  }
}
