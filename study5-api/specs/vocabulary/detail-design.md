# 📋 Detail Design: Vocabulary Module

## 1. Tổng quan Module

### 1.1 Mô tả

Module Vocabulary cho phép quản lý và học từ vựng tiếng Trung theo cấp độ HSK từ 1 đến 6, bao gồm hiển thị pinyin, nghĩa tiếng Việt, câu ví dụ và hỗ trợ học theo level.

### 1.2 Mục tiêu

- Quản lý từ vựng tiếng Trung theo cấp độ HSK
- Hỗ trợ Student học từ vựng theo level
- Tìm kiếm từ vựng nhanh chóng
- Hiển thị pinyin, nghĩa tiếng Việt và câu ví dụ
- Hỗ trợ flashcard (tương lai)

### 1.3 Phạm vi

- **Trong phạm vi:** CRUD từ vựng, tìm kiếm, xem chi tiết, học theo HSK level
- **Ngoài phạm vi:** Flashcard, quiz, spaced repetition, user progress tracking

---

## 2. Database Schema

### 2.1 Entity Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                      Vocabulary                               │
├─────────────────────────────────────────────────────────────┤
│  id: UUID (PK)                                               │
│  chinese: string                                             │
│  pinyin: string                                              │
│  vietnameseMeaning: string                                   │
│  exampleSentence: text (nullable)                            │
│  exampleMeaning: text (nullable)                            │
│  level: HskLevel (enum)                                      │
│  createdAt: timestamp                                        │
│  updatedAt: timestamp                                        │
│  deletedAt: timestamp (nullable, soft-delete)               │
├─────────────────────────────────────────────────────────────┤
│  Relations:                                                  │
│  - 1:N → UserVocabularyProgress (future)                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Entity Fields

#### VocabularyEntity

| Field               | Type           | Constraints        | Mô tả                |
| ------------------- | -------------- | ------------------ | -------------------- |
| `id`                | UUID           | PK, auto-generated | Khóa chính           |
| `chinese`           | VARCHAR(100)   | NOT NULL           | Từ tiếng Trung       |
| `pinyin`            | VARCHAR(255)   | NOT NULL           | Phiên âm pinyin      |
| `vietnameseMeaning` | VARCHAR(500)   | NOT NULL           | Nghĩa tiếng Việt     |
| `exampleSentence`   | TEXT           | NULLABLE           | Câu ví dụ            |
| `exampleMeaning`    | TEXT           | NULLABLE           | Nghĩa câu ví dụ      |
| `level`             | ENUM(HskLevel) | NOT NULL           | Cấp độ HSK           |
| `createdAt`         | TIMESTAMP      | auto               | Thời gian tạo        |
| `updatedAt`         | TIMESTAMP      | auto               | Thời gian cập nhật   |
| `deletedAt`         | TIMESTAMP      | NULLABLE           | Thời gian xóa (soft) |

### 2.3 Enums

```typescript
// src/common/constants/vocabulary.constant.ts
export enum HskLevel {
  HSK1 = "HSK1",
  HSK2 = "HSK2",
  HSK3 = "HSK3",
  HSK4 = "HSK4",
  HSK5 = "HSK5",
  HSK6 = "HSK6",
}

export const VOCABULARY_TABLE_NAME = "vocabularies";
```

---

## 3. API Endpoints

### 3.1 Base URL

```
/api/v1/vocabularies
```

### 3.2 Endpoints

| Method | Endpoint                               | Mô tả                  | Auth Required | Roles          |
| ------ | -------------------------------------- | ---------------------- | ------------- | -------------- |
| GET    | `/api/v1/vocabularies`                 | Danh sách (phân trang) | ✅            | Admin, Student |
| POST   | `/api/v1/vocabularies`                 | Tạo mới                | ✅            | Admin          |
| GET    | `/api/v1/vocabularies/:id`             | Chi tiết               | ✅            | Admin, Student |
| PUT    | `/api/v1/vocabularies/:id`             | Cập nhật toàn phần     | ✅            | Admin          |
| PATCH  | `/api/v1/vocabularies/:id`             | Cập nhật từng phần     | ✅            | Admin          |
| DELETE | `/api/v1/vocabularies/:id`             | Xóa (soft-delete)      | ✅            | Admin          |
| GET    | `/api/v1/vocabularies/levels`          | Danh sách HSK levels   | ❌            | -              |
| GET    | `/api/v1/vocabularies/by-level/:level` | Từ vựng theo HSK       | ✅            | Admin, Student |

### 3.3 Query Parameters (List)

| Param      | Type     | Default   | Mô tả              |
| ---------- | -------- | --------- | ------------------ |
| `page`     | number   | 1         | Trang hiện tại     |
| `pageSize` | number   | 20        | Số item mỗi trang  |
| `sortBy`   | string   | createdAt | Trường sắp xếp     |
| `sortDir`  | asc/desc | desc      | Hướng sắp xếp      |
| `q`        | string   | -         | Từ khóa tìm kiếm   |
| `level`    | string   | -         | Lọc theo HSK level |
| `fromDate` | date     | -         | Lọc từ ngày        |
| `toDate`   | date     | -         | Lọc đến ngày       |

---

## 4. DTOs

### 4.1 CreateVocabularyDto

```typescript
// src/modules/vocabulary/dto/create-vocabulary.dto.ts
export class CreateVocabularyDto {
  chinese: string; // @IsNotEmpty, @MaxLength(100)
  pinyin: string; // @IsNotEmpty, @MaxLength(255)
  vietnameseMeaning: string; // @IsNotEmpty, @MaxLength(500)
  exampleSentence?: string; // @IsOptional, @IsString
  exampleMeaning?: string; // @IsOptional, @IsString
  level: HskLevel; // @IsNotEmpty, @IsEnum(HskLevel)
}
```

### 4.2 UpdateVocabularyDto

```typescript
// src/modules/vocabulary/dto/update-vocabulary.dto.ts
export class UpdateVocabularyDto {
  chinese?: string; // @IsOptional, @MaxLength(100)
  pinyin?: string; // @IsOptional, @MaxLength(255)
  vietnameseMeaning?: string; // @IsOptional, @MaxLength(500)
  exampleSentence?: string; // @IsOptional, @IsString
  exampleMeaning?: string; // @IsOptional, @IsString
  level?: HskLevel; // @IsOptional, @IsEnum(HskLevel)
}
```

### 4.3 ListVocabularyQueryDto

```typescript
// src/modules/vocabulary/dto/list-vocabulary-query.dto.ts
export class ListVocabularyQueryDto {
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @IsOptional() @IsString() sortBy?: string = "createdAt";
  @IsOptional() @IsIn(["asc", "desc"]) sortDir?: "asc" | "desc" = "desc";
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsEnum(HskLevel) level?: HskLevel;
  @IsOptional() @IsDateString() fromDate?: string;
  @IsOptional() @IsDateString() toDate?: string;
}
```

### 4.4 DetailVocabularyParamDto

```typescript
// src/modules/vocabulary/dto/detail-vocabulary-param.dto.ts
export class DetailVocabularyParamDto {
  @IsUUID() id: string;
}
```

### 4.5 VocabularyByLevelParamDto

```typescript
// src/modules/vocabulary/dto/vocabulary-by-level-param.dto.ts
export class VocabularyByLevelParamDto {
  @IsEnum(HskLevel) level: HskLevel;
}
```

### 4.6 Response DTO

```typescript
// src/modules/vocabulary/dto/response/vocabulary-response.dto.ts
export class VocabularyResponseDto {
  id: string;
  chinese: string;
  pinyin: string;
  vietnameseMeaning: string;
  exampleSentence: string | null;
  exampleMeaning: string | null;
  level: HskLevel;
  createdAt: Date;
  updatedAt: Date;
}

export class VocabularyListResponseDto {
  items: VocabularyResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}

export class HskLevelResponseDto {
  level: HskLevel;
  label: string;
  count: number;
}
```

---

## 5. Service Layer

### 5.1 VocabularyService Methods

| Method               | Description                                     |
| -------------------- | ----------------------------------------------- |
| `create(dto)`        | Tạo mới từ vựng                                 |
| `findAll(query)`     | Lấy danh sách từ vựng có phân trang và lọc      |
| `findById(id)`       | Lấy chi tiết từ vựng                            |
| `update(id, dto)`    | Cập nhật từ vựng                                |
| `remove(id)`         | Xóa mềm từ vựng                                 |
| `findByLevel(level)` | Lấy từ vựng theo HSK level                      |
| `getAllLevels()`     | Lấy danh sách tất cả HSK levels với số lượng từ |

### 5.2 Detailed Service Implementation

#### 5.2.1 `create(dto: CreateVocabularyDto): Promise<VocabularyResponseDto>`

**Mục đích:** Tạo mới một từ vựng

**Các bước thực hiện:**

````
Bước 1: Validate input
   - DTO đã được validate bởi class-validator trong Controller
   - Service không cần validate lại

Bước 2: Kiểm tra trùng lặp
   - Gọi repository.findByChinese(dto.chinese)
   - Nếu tồn tại → throw DuplicateChineseException

Bước 3: Tạo entity
   - Tạo instance VocabularyEntity với các fields:
     • id: tự động generate (UUID)
     • chinese: dto.chinese
     • pinyin: dto.pinyin
     • vietnameseMeaning: dto.vietnameseMeaning
     • exampleSentence: dto.exampleSentence || null
     • exampleMeaning: dto.exampleMeaning || null
     • level: dto.level
     • createdAt: new Date()
     • updatedAt: new Date()

Bước 4: Lưu vào database
   - Gọi repository.save(entity)
   - Nhận về entity đã được persist

Bước 5: Transform response
   - Map entity → VocabularyResponseDto
   - Trả về response

Pseudo-code:
```typescript
async create(dto: CreateVocabularyDto): Promise<VocabularyResponseDto> {
  // Step 1: Validate input (done by DTO)

  // Step 2: Check duplicate
  const existing = await this.repository.findByChinese(dto.chinese);
  if (existing) {
    throw new DuplicateChineseException(dto.chinese);
  }

  // Step 3: Create entity
  const entity = this.repository.create({
    chinese: dto.chinese,
    pinyin: dto.pinyin,
    vietnameseMeaning: dto.vietnameseMeaning,
    exampleSentence: dto.exampleSentence,
    exampleMeaning: dto.exampleMeaning,
    level: dto.level,
  });

  // Step 4: Save to DB
  const saved = await this.repository.save(entity);

  // Step 5: Transform response
  return this.toResponseDto(saved);
}
````

```

---

#### 5.2.2 `findAll(query: ListVocabularyQueryDto): Promise<VocabularyListResponseDto>`

**Mục đích:** Lấy danh sách từ vựng có phân trang và lọc

**Các bước thực hiện:**

```

Bước 1: Validate và normalize query parameters

- Set default values nếu không có:
  • page: 1
  • pageSize: 20
  • sortBy: 'createdAt'
  • sortDir: 'desc'
- Validate các giá trị (page > 0, pageSize <= 100)

Bước 2: Build WHERE conditions

- Nếu có query.q:
  • ILIKE search trên chinese, pinyin, vietnameseMeaning
- Nếu có query.level:
  • Thêm điều kiện level = query.level
- Nếu có query.fromDate:
  • Thêm điều kiện createdAt >= fromDate
- Nếu có query.toDate:
  • Thêm điều kiện createdAt <= toDate
- Luôn thêm điều kiện deletedAt IS NULL (không lấy soft-deleted)

Bước 3: Build ORDER BY

- sortBy và sortDir từ query
- Default: ORDER BY createdAt DESC

Bước 4: Query database với pagination

- Gọi repository.findAllWithPagination(query)
- Trả về { items, total, page, pageSize }

Bước 5: Transform items

- Map mỗi entity → VocabularyResponseDto
- Trả về VocabularyListResponseDto

Pseudo-code:

```typescript
async findAll(query: ListVocabularyQueryDto): Promise<VocabularyListResponseDto> {
  // Step 1: Normalize params
  const normalizedQuery = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    sortBy: query.sortBy ?? 'createdAt',
    sortDir: query.sortDir ?? 'desc',
    q: query.q,
    level: query.level,
    fromDate: query.fromDate,
    toDate: query.toDate,
  };

  // Step 2-4: Query with pagination
  const result = await this.repository.findAllWithPagination(normalizedQuery);

  // Step 5: Transform
  return {
    items: result.items.map(item => this.toResponseDto(item)),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}
```

```

---

#### 5.2.3 `findById(id: string): Promise<VocabularyResponseDto>`

**Mục đích:** Lấy chi tiết một từ vựng theo ID

**Các bước thực hiện:**

```

Bước 1: Validate UUID format

- ID đã được validate bởi @IsUUID() trong DTO

Bước 2: Query database

- Gọi repository.findById(id)
- Chỉ lấy bản ghi có deletedAt = null

Bước 3: Kiểm tra tồn tại

- Nếu không tìm thấy → throw VocabularyNotFoundException

Bước 4: Transform response

- Map entity → VocabularyResponseDto
- Trả về response

Pseudo-code:

```typescript
async findById(id: string): Promise<VocabularyResponseDto> {
  // Step 1: Validate (done by DTO)

  // Step 2: Query
  const entity = await this.repository.findById(id);

  // Step 3: Check existence
  if (!entity) {
    throw new VocabularyNotFoundException(id);
  }

  // Step 4: Transform
  return this.toResponseDto(entity);
}
```

```

---

#### 5.2.4 `update(id: string, dto: UpdateVocabularyDto): Promise<VocabularyResponseDto>`

**Mục đích:** Cập nhật thông tin từ vựng

**Các bước thực hiện:**

```

Bước 1: Validate input và ID

- DTO và ID đã được validate bởi Controller

Bước 2: Tìm bản ghi hiện tại

- Gọi repository.findById(id)
- Nếu không tồn tại → throw VocabularyNotFoundException

Bước 3: Kiểm tra trùng lặp chinese (nếu có thay đổi)

- Nếu dto.chinese khác với entity hiện tại:
  • Gọi repository.findByChinese(dto.chinese)
  • Nếu tồn tại → throw DuplicateChineseException

Bước 4: Update entity

- Merge dto vào entity:
  • Với mỗi field trong dto, nếu có giá trị thì update
- Set updatedAt = new Date()

Bước 5: Lưu vào database

- Gọi repository.save(entity)

Bước 6: Transform response

- Map entity → VocabularyResponseDto
- Trả về response

Pseudo-code:

```typescript
async update(id: string, dto: UpdateVocabularyDto): Promise<VocabularyResponseDto> {
  // Step 1: Validate (done by DTO)

  // Step 2: Find current record
  const entity = await this.repository.findById(id);
  if (!entity) {
    throw new VocabularyNotFoundException(id);
  }

  // Step 3: Check duplicate chinese
  if (dto.chinese && dto.chinese !== entity.chinese) {
    const existing = await this.repository.findByChinese(dto.chinese);
    if (existing) {
      throw new DuplicateChineseException(dto.chinese);
    }
  }

  // Step 4: Update entity
  Object.assign(entity, {
    ...dto,
    updatedAt: new Date(),
  });

  // Step 5: Save to DB
  const updated = await this.repository.save(entity);

  // Step 6: Transform
  return this.toResponseDto(updated);
}
```

```

---

#### 5.2.5 `remove(id: string): Promise<void>`

**Mục đích:** Xóa mềm một từ vựng

**Các bước thực hiện:**

```

Bước 1: Validate ID

- ID đã được validate bởi @IsUUID() trong DTO

Bước 2: Tìm bản ghi hiện tại

- Gọi repository.findById(id)
- Nếu không tồn tại → throw VocabularyNotFoundException

Bước 3: Kiểm tra relation (tương lai)

- Nếu có UserVocabularyProgress liên quan:
  • Tùy business rule: reject hoặc cascade delete
- Hiện tại: skip (chưa có relation)

Bước 4: Soft delete

- Set deletedAt = new Date()
- Gọi repository.save(entity) hoặc repository.softDelete(id)

Bước 5: Trả về void

Pseudo-code:

```typescript
async remove(id: string): Promise<void> {
  // Step 1: Validate (done by DTO)

  // Step 2: Find current record
  const entity = await this.repository.findById(id);
  if (!entity) {
    throw new VocabularyNotFoundException(id);
  }

  // Step 3: Check relations (future)
  // const progress = await this.progressRepo.findByVocabularyId(id);
  // if (progress.length > 0) {
  //   throw new HasRelatedRecordsException();
  // }

  // Step 4: Soft delete
  await this.repository.softDelete(id);

  // Step 5: Return void
}
```

```

---

#### 5.2.6 `findByLevel(level: HskLevel): Promise<VocabularyResponseDto[]>`

**Mục đích:** Lấy tất cả từ vựng thuộc một HSK level cụ thể

**Các bước thực hiện:**

```

Bước 1: Validate HSK level

- Level đã được validate bởi @IsEnum(HskLevel) trong DTO

Bước 2: Query database

- Gọi repository.findByLevel(level)
- Chỉ lấy các bản ghi có deletedAt = null
- Order by chinese ASC

Bước 3: Transform response

- Map mỗi entity → VocabularyResponseDto
- Trả về array

Pseudo-code:

```typescript
async findByLevel(level: HskLevel): Promise<VocabularyResponseDto[]> {
  // Step 1: Validate (done by DTO)

  // Step 2: Query
  const entities = await this.repository.findByLevel(level);

  // Step 3: Transform
  return entities.map(entity => this.toResponseDto(entity));
}
```

```

---

#### 5.2.7 `getAllLevels(): Promise<HskLevelResponseDto[]>`

**Mục đích:** Lấy danh sách tất cả HSK levels kèm số lượng từ vựng

**Các bước thực hiện:**

```

Bước 1: Query database

- Gọi repository.countByLevel()
- Trả về array: [{ level: HSK1, count: 150 }, ...]

Bước 2: Build response với label

- Map kết quả thành HskLevelResponseDto:
  • level: giá trị enum
  • label: tên hiển thị (e.g., "HSK 1 - 150 từ")
  • count: số lượng từ

Bước 3: Handle missing levels

- Nếu một level không có từ vựng nào:
  • Vẫn include vào response với count = 0

Pseudo-code:

```typescript
async getAllLevels(): Promise<HskLevelResponseDto[]> {
  // Step 1: Query counts
  const counts = await this.repository.countByLevel();
  const countMap = new Map(counts.map(c => [c.level, c.count]));

  // Step 2-3: Build response with all levels
  return Object.values(HskLevel).map(level => ({
    level,
    label: `HSK ${level.replace('HSK', '')}`,
    count: countMap.get(level) ?? 0,
  }));
}
```

````

---

#### 5.2.8 Helper Method: `toResponseDto(entity: VocabularyEntity)`

**Mục đích:** Chuyển đổi entity sang response DTO

```typescript
private toResponseDto(entity: VocabularyEntity): VocabularyResponseDto {
  return {
    id: entity.id,
    chinese: entity.chinese,
    pinyin: entity.pinyin,
    vietnameseMeaning: entity.vietnameseMeaning,
    exampleSentence: entity.exampleSentence,
    exampleMeaning: entity.exampleMeaning,
    level: entity.level,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
````

### 5.3 Business Rules

| Rule ID | Mô tả                                         | Priority |
| ------- | --------------------------------------------- | -------- |
| BR-001  | Từ tiếng Trung (chinese) không được trùng lặp | HIGH     |
| BR-002  | Pinyin phải hợp lệ theo format pinyin         | MEDIUM   |
| BR-003  | Chỉ Admin mới được thêm/sửa/xóa từ vựng       | HIGH     |
| BR-004  | Student chỉ được xem và học từ vựng           | HIGH     |

---

## 6. Repository Layer

### 6.1 VocabularyRepository

```typescript
// src/modules/vocabulary/repositories/vocabulary.repository.ts
@Injectable()
export class VocabularyRepository extends BaseRepository<VocabularyEntity> {
  constructor(
    @InjectRepository(VocabularyEntity)
    repository: Repository<VocabularyEntity>,
  ) {
    super(repository);
  }

  async findAllWithPagination(
    query: ListVocabularyQueryDto,
  ): Promise<PaginatedResult<VocabularyEntity>>;
  async findById(id: string): Promise<VocabularyEntity | null>;
  async findByChinese(chinese: string): Promise<VocabularyEntity | null>;
  async findByLevel(level: HskLevel): Promise<VocabularyEntity[]>;
  async softDelete(id: string): Promise<void>;
  async countByLevel(): Promise<{ level: HskLevel; count: number }[]>;
}
```

---

## 7. Controller Layer

### 7.1 VocabularyController

```typescript
// src/modules/vocabulary/vocabulary.controller.ts
@Controller('vocabularies')
@ApiTags('Vocabulary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateVocabularyDto): Promise<ApiResponse<VocabularyResponseDto>>;

  @Get()
  async findAll(@Query() query: ListVocabularyQueryDto): Promise<ApiResponse<VocabularyListResponseDto>>;

  @Get('levels')
  async getAllLevels(): Promise<ApiResponse<HskLevelResponseDto[]>>;

  @Get('by-level/:level')
  async findByLevel(@Param() param: VocabularyByLevelParamDto): Promise<ApiResponse<VocabularyResponseDto[]>>;

  @Get(':id')
  async findOne(@Param() param: DetailVocabularyParamDto): Promise<ApiResponse<VocabularyResponseDto>>;

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param() param: DetailVocabularyParamDto,
    @Body() dto: UpdateVocabularyDto,
  ): Promise<ApiResponse<VocabularyResponseDto>>;

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  async remove(@Param() param: DetailVocabularyParamDto): Promise<void>;
}
```

---

## 8. Module Structure

### 8.1 Directory Tree

```
src/
├── database/
│   └── entities/
│       └── vocabulary.entity.ts
├── modules/
│   └── vocabulary/
│       ├── vocabulary.controller.ts
│       ├── vocabulary.module.ts
│       ├── dto/
│       │   ├── create-vocabulary.dto.ts
│       │   ├── update-vocabulary.dto.ts
│       │   ├── list-vocabulary-query.dto.ts
│       │   ├── detail-vocabulary-param.dto.ts
│       │   ├── vocabulary-by-level-param.dto.ts
│       │   └── response/
│       │       └── vocabulary-response.dto.ts
│       ├── repositories/
│       │   └── vocabulary.repository.ts
│       └── services/
│           └── vocabulary.service.ts
└── common/
    ├── constants/
    │   └── vocabulary.constant.ts
    └── repositories/
        └── base.repository.ts
```

---

## 9. Error Handling

### 9.1 Custom Exceptions

| Exception                     | HTTP Status | Error Code             |
| ----------------------------- | ----------- | ---------------------- |
| `VocabularyNotFoundException` | 404         | `VOCABULARY_NOT_FOUND` |
| `DuplicateChineseException`   | 409         | `DUPLICATE_CHINESE`    |
| `InvalidHskLevelException`    | 400         | `INVALID_HSK_LEVEL`    |

### 9.2 Error Response Format

```json
{
  "statusCode": 404,
  "message": "Vocabulary not found",
  "error": "Not Found",
  "code": "VOCABULARY_NOT_FOUND",
  "details": {
    "id": "uuid-string"
  }
}
```

---

## 10. Validation & Constraints

### 10.1 Field Validations

| Field             | Rules                                  |
| ----------------- | -------------------------------------- |
| chinese           | required, max 100 chars, unique        |
| pinyin            | required, max 255 chars                |
| vietnameseMeaning | required, max 500 chars                |
| exampleSentence   | optional, max 1000 chars               |
| exampleMeaning    | optional, max 500 chars                |
| level             | required, must be valid HSK1-HSK6 enum |

### 10.2 Business Validations

- [ ] Kiểm tra từ tiếng Trung (chinese) không trùng lặp khi tạo/cập nhật
- [ ] Kiểm tra bản ghi tồn tại trước khi thao tác
- [ ] Kiểm tra quyền Admin cho các action thêm/sửa/xóa
- [ ] Validate HSK level hợp lệ (HSK1-HSK6)

---
