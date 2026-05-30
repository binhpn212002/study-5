# 📋 Detail Design: UserVocabulary (User Saved Vocabulary)

## 1. Tổng quan Module

### 1.1 Mô tả

Module quản lý từ vựng đã lưu của user, cho phép lưu từ vựng vào danh sách học sau, theo dõi trạng thái học từng từ và học theo danh sách cá nhân.

### 1.2 Mục tiêu

- Cho phép user lưu/bỏ lưu từ vựng vào danh sách học
- Hỗ trợ xem lại danh sách từ đã lưu với bộ lọc đa dạng
- Theo dõi trạng thái học từng từ (NEW → LEARNING → REVIEWING → MASTERED)
- Cho phép Admin xem tất cả user vocab để quản lý

### 1.3 Phạm vi

- **Trong phạm vi:**
  - Save/unsave từ vựng cho Student
  - Xem danh sách từ đã lưu với filter/pagination
  - Cập nhật trạng thái học từ vựng
  - Admin xem tất cả user vocab
- **Ngoài phạm vi:**
  - Quiz/học từ vựng tự động
  - Spaced repetition algorithm
  - Audio pronunciations
  - Quản lý từ vựng gốc (Vocabulary module quản lý)

---

## 2. Database Schema

### 2.1 Entity Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                      UserVocabulary                             │
├─────────────────────────────────────────────────────────────┤
│  id: UUID (PK)                                               │
│  userId: UUID (FK)                                           │
│  vocabId: UUID (FK)                                          │
│  isSaved: BOOLEAN                                            │
│  status: ENUM(VocabStatus)                                   │
│  createdAt: timestamp                                        │
│  updatedAt: timestamp                                        │
├─────────────────────────────────────────────────────────────┤
│  Relations:                                                  │
│  - N:1 → User                                                │
│  - N:1 → Vocabulary                                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Entity Fields

#### UserVocabularyEntity

| Field      | Type         | Constraints                          | Mô tả                 |
| ---------- | ------------ | ------------------------------------ | --------------------- |
| `id`       | UUID         | PK, auto-generated                   | Khóa chính            |
| `userId`   | UUID         | NOT NULL, FK → User                 | ID của user           |
| `vocabId`  | UUID         | NOT NULL, FK → Vocabulary           | ID của từ vựng        |
| `isSaved`  | BOOLEAN      | NOT NULL, DEFAULT true              | Đã lưu hay chưa       |
| `status`   | ENUM         | NOT NULL, DEFAULT 'NEW'             | Trạng thái học        |
| `createdAt`| TIMESTAMP    | auto                                | Thời gian tạo         |
| `updatedAt`| TIMESTAMP    | auto                                | Thời gian cập nhật    |

### 2.3 Enums

```typescript
// src/common/constants/vocab-status.constant.ts
export enum VocabStatus {
  NEW = 'NEW',
  LEARNING = 'LEARNING',
  REVIEWING = 'REVIEWING',
  MASTERED = 'MASTERED',
}

// src/common/constants/hsk.constant.ts
export enum HskLevel {
  HSK1 = 'HSK1',
  HSK2 = 'HSK2',
  HSK3 = 'HSK3',
  HSK4 = 'HSK4',
  HSK5 = 'HSK5',
  HSK6 = 'HSK6',
}

export const USER_VOCABULARY_TABLE_NAME = 'user_vocabularies';
```

---

## 3. API Endpoints

### 3.1 Base URL

```
/api/v1/user-vocab
```

### 3.2 Endpoints

| Method | Endpoint                          | Mô tả                        | Auth Required |
| ------ | --------------------------------- | ---------------------------- | ------------- |
| POST   | `/api/v1/user-vocab/save`         | Lưu từ vựng                  | ✅ (Student)  |
| DELETE | `/api/v1/user-vocab/remove/:vocabId` | Bỏ lưu từ vựng            | ✅ (Student)  |
| GET    | `/api/v1/user-vocab`              | Danh sách đã lưu (phân trang)| ✅            |
| GET    | `/api/v1/user-vocab/:vocabId`     | Chi tiết 1 từ đã lưu         | ✅            |
| PATCH  | `/api/v1/user-vocab/:vocabId/status` | Cập nhật trạng thái học  | ✅            |
| GET    | `/api/v1/admin/user-vocab`        | Danh sách tất cả user vocab  | ✅ (Admin)    |

### 3.3 Query Parameters (List)

| Param      | Type     | Default   | Mô tả                 |
| ---------- | -------- | --------- | --------------------- |
| `page`     | number   | 1         | Trang hiện tại        |
| `pageSize` | number   | 20        | Số item mỗi trang      |
| `sortBy`   | string   | createdAt | Trường sắp xếp        |
| `sortDir`  | asc/desc | desc      | Hướng sắp xếp         |
| `level`    | string   | -         | Lọc theo cấp độ HSK   |
| `status`   | string   | -         | Lọc theo trạng thái   |

---

## 4. DTOs

### 4.1 SaveVocabularyDto

```typescript
// src/modules/user-vocab/dto/save-vocabulary.dto.ts
export class SaveVocabularyDto {
  vocabId: string;  // @IsNotEmpty, @IsUUID
}
```

### 4.2 UpdateVocabStatusDto

```typescript
// src/modules/user-vocab/dto/update-vocab-status.dto.ts
export class UpdateVocabStatusDto {
  status: VocabStatus;  // @IsNotEmpty, @IsEnum(VocabStatus)
}
```

### 4.3 ListUserVocabQueryDto

```typescript
// src/modules/user-vocab/dto/list-user-vocab-query.dto.ts
export class ListUserVocabQueryDto {
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortDir?: 'asc' | 'desc' = 'desc';
  @IsOptional() @IsEnum(HskLevel) level?: HskLevel;
  @IsOptional() @IsEnum(VocabStatus) status?: VocabStatus;
}
```

### 4.4 DetailUserVocabParamDto

```typescript
// src/modules/user-vocab/dto/detail-user-vocab-param.dto.ts
export class DetailUserVocabParamDto {
  @IsUUID() vocabId: string;
}
```

### 4.5 Response DTO

```typescript
// src/modules/user-vocab/dto/response/user-vocab-response.dto.ts
export class UserVocabResponseDto {
  id: string;
  vocabId: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  level: HskLevel;
  isSaved: boolean;
  status: VocabStatus;
  savedAt: Date;
}

export class UserVocabListResponseDto {
  items: UserVocabResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 5. Service Layer

### 5.1 UserVocabService Methods

**save(userId: string, dto: SaveVocabularyDto)**
- Validate DTO
- Check vocabulary exists
- Check if record already exists (userId + vocabId)
- If exists → update isSaved = true
- If not exists → create new with isSaved = true, status = NEW
- Return UserVocabulary with vocab details

**remove(userId: string, vocabId: string)**
- Find existing record by userId + vocabId
- Update isSaved = false (soft remove)
- Return void

**findAll(userId: string, query: ListUserVocabQueryDto)**
- Validate query params
- Build query with filters (level, status) and pagination
- Filter by userId and isSaved = true
- Return paginated result with vocab details

**findByVocabId(userId: string, vocabId: string)**
- Find record by userId + vocabId
- Throw NotFound if not exists or not saved
- Return record with vocab details

**updateStatus(userId: string, vocabId: string, dto: UpdateVocabStatusDto)**
- Find existing record
- Validate status transition
- Update status
- Return updated record

**findAllAdmin(query: ListUserVocabQueryDto)**
- Admin only: view all user vocab records
- Support filter by userId (optional)
- Return paginated result

### 5.2 Business Rules

| Rule ID | Mô tả                                                    | Priority |
| ------- | -------------------------------------------------------- | -------- |
| BR-001  | 1 user chỉ có 1 record cho 1 vocab (UNIQUE userId + vocabId) | HIGH |
| BR-002  | Remove chỉ set isSaved = false, không hard delete       | HIGH     |
| BR-003  | Save mới → status mặc định = NEW                        | HIGH     |
| BR-004  | Student chỉ thấy và thao tác vocab của chính mình       | HIGH     |
| BR-005  | Status transition: NEW → LEARNING → REVIEWING → MASTERED | MEDIUM |
| BR-006  | Admin có thể xem tất cả user vocab                      | MEDIUM   |

---

## 6. Repository Layer

### 6.1 UserVocabRepository

```typescript
// src/modules/user-vocab/repositories/user-vocab.repository.ts
@Injectable()
export class UserVocabRepository extends BaseRepository<UserVocabularyEntity> {
  constructor(
    @InjectRepository(UserVocabularyEntity)
    repository: Repository<UserVocabularyEntity>,
  ) {
    super(repository);
  }

  async findByUserIdAndVocabId(userId: string, vocabId: string): Promise<UserVocabularyEntity | null>;
  async findAllWithPagination(userId: string, query: ListUserVocabQueryDto): Promise<PaginatedResult<UserVocabularyEntity>>;
  async findAllAdminWithPagination(query: ListUserVocabQueryDto): Promise<PaginatedResult<UserVocabularyEntity>>;
  async upsert(userId: string, vocabId: string, isSaved: boolean, status: VocabStatus): Promise<UserVocabularyEntity>;
}
```

---

## 7. Controller Layer

### 7.1 UserVocabController

```typescript
// src/modules/user-vocab/user-vocab.controller.ts
@Controller('user-vocab')
@ApiTags('UserVocabulary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserVocabController {
  constructor(private readonly userVocabService: UserVocabService) {}

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  async save(
    @CurrentUser() user: UserPayload,
    @Body() dto: SaveVocabularyDto,
  ): Promise<ApiResponse<UserVocabResponseDto>>;

  @Delete('remove/:vocabId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: UserPayload,
    @Param() param: DetailUserVocabParamDto,
  ): Promise<void>;

  @Get()
  async findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: ListUserVocabQueryDto,
  ): Promise<ApiResponse<UserVocabListResponseDto>>;

  @Get(':vocabId')
  async findOne(
    @CurrentUser() user: UserPayload,
    @Param() param: DetailUserVocabParamDto,
  ): Promise<ApiResponse<UserVocabResponseDto>>;

  @Patch(':vocabId/status')
  async updateStatus(
    @CurrentUser() user: UserPayload,
    @Param() param: DetailUserVocabParamDto,
    @Body() dto: UpdateVocabStatusDto,
  ): Promise<ApiResponse<UserVocabResponseDto>>;
}
```

### 7.2 AdminUserVocabController

```typescript
// src/modules/user-vocab/admin-user-vocab.controller.ts
@Controller('admin/user-vocab')
@ApiTags('Admin/UserVocabulary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUserVocabController {
  constructor(private readonly userVocabService: UserVocabService) {}

  @Get()
  async findAll(
    @Query() query: ListUserVocabQueryDto,
  ): Promise<ApiResponse<UserVocabListResponseDto>>;
}
```

---

## 8. Module Structure

### 8.1 Directory Tree

```
src/
├── database/
│   └── entities/
│       └── user-vocabulary.entity.ts
├── modules/
│   └── user-vocab/
│       ├── user-vocab.controller.ts
│       ├── user-vocab.module.ts
│       ├── admin-user-vocab.controller.ts
│       ├── dto/
│       │   ├── save-vocabulary.dto.ts
│       │   ├── update-vocab-status.dto.ts
│       │   ├── list-user-vocab-query.dto.ts
│       │   ├── detail-user-vocab-param.dto.ts
│       │   └── response/
│       │       └── user-vocab-response.dto.ts
│       ├── repositories/
│       │   └── user-vocab.repository.ts
│       └── services/
│           └── user-vocab.service.ts
└── common/
    ├── constants/
    │   ├── vocab-status.constant.ts
    │   └── hsk.constant.ts
    └── repositories/
        └── base.repository.ts
```

---

## 9. Error Handling

### 9.1 Custom Exceptions

| Exception                        | HTTP Status | Error Code              |
| -------------------------------- | ----------- | ---------------------- |
| `UserVocabNotFoundException`     | 404         | `USER_VOCAB_NOT_FOUND` |
| `VocabularyNotFoundException`   | 404         | `VOCAB_NOT_FOUND`      |
| `InvalidStatusTransitionException` | 400       | `INVALID_STATUS`       |
| `UnauthorizedException`          | 401         | `UNAUTHORIZED`         |
| `ForbiddenException`             | 403         | `FORBIDDEN`            |

### 9.2 Error Response Format

```json
{
  "statusCode": 404,
  "message": "User vocabulary not found",
  "error": "Not Found",
  "code": "USER_VOCAB_NOT_FOUND",
  "details": {
    "vocabId": "uuid-string"
  }
}
```

---

## 10. Validation & Constraints

### 10.1 Field Validations

| Field     | Rules                                              |
| --------- | ------------------------------------------------- |
| vocabId   | required, must be valid UUID, vocab must exist    |
| status    | required, must be valid VocabStatus enum         |

### 10.2 Business Validations

- [ ] Kiểm tra vocabulary tồn tại trước khi save
- [ ] Kiểm tra bản ghi tồn tại trước khi remove/update status
- [ ] Kiểm tra user chỉ thao tác vocab của chính mình
- [ ] Validate status transition hợp lệ (NEW → LEARNING → REVIEWING → MASTERED)

---

## 11. Indexing Strategy

### 11.1 Database Indexes

```sql
-- Index for user lookup
CREATE INDEX idx_user_vocab_user_id ON user_vocabularies(user_id);

-- Index for filtering by saved status
CREATE INDEX idx_user_vocab_is_saved ON user_vocabularies(is_saved);

-- Index for status filter
CREATE INDEX idx_user_vocab_status ON user_vocabularies(status);

-- Composite index for user + vocab lookup
CREATE UNIQUE INDEX idx_user_vocab_user_vocab ON user_vocabularies(user_id, vocab_id);

-- Index for vocab level join
CREATE INDEX idx_user_vocab_vocab_id ON user_vocabularies(vocab_id);
```

---

## 12. Role Permissions

### 12.1 Permission Matrix

| Endpoint                          | Admin | Student | Guest |
| --------------------------------- | ----- | ------- | ----- |
| POST /user-vocab/save             | ❌    | ✅      | ❌    |
| DELETE /user-vocab/remove/:vocabId| ❌    | ✅      | ❌    |
| GET /user-vocab                   | ❌    | ✅      | ❌    |
| GET /user-vocab/:vocabId          | ❌    | ✅      | ❌    |
| PATCH /user-vocab/:vocabId/status | ❌    | ✅      | ❌    |
| GET /admin/user-vocab             | ✅    | ❌      | ❌    |
