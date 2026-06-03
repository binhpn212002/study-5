import { DataSource } from 'typeorm';
import { UserRole, UserStatus } from '../../common/constants/user.constant';
import { User } from '../entities/user.entity';
import { createOrGetFirebaseUidByPhone } from './firebase-auth.seed-helper';

type SeedUserDef = {
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
};

const SEED_USERS: SeedUserDef[] = [
  {
    phone: "0900000001",
    role: UserRole.ADMIN,
    email: "admin@gmail.com",
    firstName: "Quản trị viên",
    lastName: "Quản trị viên",
  },
  {
    phone: "0900000002",
    firstName: "Nhân viên kho",
    lastName: "Nhân viên kho",
    role: UserRole.USER,
    email: "warehouse@gmail.com",
  },
];

/**
 * Tạo hoặc lấy user Firebase Auth theo SĐT → uid thật, rồi mới lưu DB.
 */
async function resolveFirebaseUidForSeed(def: SeedUserDef): Promise<string> {
  console.log(
    `[seed] Gọi Firebase Auth (create/get theo SĐT) → lấy firebase_id cho ${def.email}`,
  );
  const uid = await createOrGetFirebaseUidByPhone(
    def.phone,
    def.firstName,
    def.lastName,
    def.email,
  );
  if (!uid) {
    throw new Error(
      `[seed] Không lấy được Firebase uid cho ${def.email}: cấu hình FIREBASE_SERVICE_ACCOUNT_JSON_FILE, ` +
        "FIREBASE_SERVICE_ACCOUNT_JSON_B64 hoặc FIREBASE_SERVICE_ACCOUNT_JSON; bật Phone provider trên Firebase Console.",
    );
  }
  return uid;
}

/**
 * Idempotent: bỏ qua nếu đã có user trùng **username** hoặc **phone**
 * (tránh lỗi UNIQUE khi đổi seed nhưng DB vẫn giữ bản ghi cũ).
 * Cần gọi sau `seedRolesAndPermissions`.
 */
export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);

  for (const def of SEED_USERS) {
    const exists = await userRepo.findOne({
      where: [{ email: def.email }, { phone: def.phone }],
    });
    if (exists) {
      continue;
    }

    const firebaseUid = await resolveFirebaseUidForSeed(def);

    const uidTaken = await userRepo.findOne({
      where: { firebaseId: firebaseUid },
    });
    if (uidTaken) {
      console.warn(
        `[seed] firebase_id ${firebaseUid} đã gán cho ${uidTaken.email} — bỏ qua ${def.email}`,
      );
      continue;
    }

    const user = userRepo.create({
      email: def.email,
      phone: def.phone,
      firebaseId: firebaseUid,
      firstName: def.firstName,
      lastName: def.lastName,
      status: UserStatus.ACTIVE,
      avatarUrl: null,
      dob: null,
    });
    await userRepo.save(user);
  }
}
