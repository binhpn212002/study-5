# 📋 Detail Design: LongSentence (HSK Long Sentence)

## 1. Tổng quan Module

### 1.1 Mô tả

Module quản lý câu dài tiếng Trung theo cấp độ HSK, phục vụ cho việc học và ôn luyện ngữ pháp, từ vựng trong ngữ cảnh câu hoàn chỉnh.

### 1.2 Mục tiêu

- Hỗ trợ Admin CRUD đầy đủ câu dài theo từng cấp độ HSK
- Cho phép Student xem danh sách và chi tiết câu dài theo level
- Tìm kiếm và lọc câu dài hiệu quả theo nhiều tiêu chí
- Đảm bảo không trùng lặp câu dài trong cùng cấp độ

### 1.3 Phạm vi

- **Trong phạm vi:**
  - CRUD câu dài cho Admin
  - Xem danh sách và chi tiết câu dài cho Student
  - Lọc và tìm kiếm câu dài theo level, từ khóa
  - Sắp xếp và phân trang danh sách câu dài
- **Ngoài phạm vi:**
  - Quản lý quan hệ câu dài với từ vựng (liên kết qua vocabulary)
  - Quiz/học thuộc câu dài
  - Audio cho câu dài

---

## 2. Database Schema

### 2.1 Entity Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                       LongSentence                            │
├─────────────────────────────────────────────────────────────┤
│  id: UUID (PK)                                               │
│  vietnamese: VARCHAR(500)                                    │
│  chinese: VARCHAR(500)                                       │
│  pinyin: VARCHAR(500)                                        │
│  meaning: TEXT                                               │
│  hint: VARCHAR(255) (nullable)                               │
│  level: ENUM(HskLevel)                                       │
│  orderIndex: INT                                             │
│  createdAt: timestamp                                        │
│  updatedAt: timestamp                                        │
│  deletedAt: timestamp (nullable, soft-delete)               │
├─────────────────────────────────────────────────────────────┤
│  Relations:                                                  │
│  - N:M → Vocabulary (qua sentence_vocabulary)                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Entity Fields

#### LongSentenceEntity

| Field       | Type         | Constraints                  | Mô tả                     |
| ----------- | ------------ | ---------------------------- | ------------------------- |
| `id`        | UUID         | PK, auto-generated           | Khóa chính                |
| `vietnamese`| VARCHAR(500) | NOT NULL                     | Câu tiếng Việt            |
| `chinese`   | VARCHAR(500) | NOT NULL                     | Câu tiếng Trung           |
| `pinyin`    | VARCHAR(500) | NOT NULL                     | Phiên âm Pinyin           |
| `meaning`   | TEXT         | NOT NULL                     | Nghĩa của câu             |
| `hint`      | VARCHAR(255) | NULLABLE                     | Gợi ý/giải thích thêm     |
| `level`     | ENUM         | NOT NULL                     | Cấp độ HSK                |
| `orderIndex`| INT          | NOT NULL, DEFAULT 0           | Thứ tự sắp xếp            |
| `createdAt` | TIMESTAMP    | auto                         | Thời gian tạo             |
| `updatedAt` | TIMESTAMP    | auto                         | Thời gian cập nhật        |
| `deletedAt` | TIMESTAMP    | NULLABLE                     | Thời gian xóa (soft)      |

### 2.3 Enums

```typescript
// src/common/constants/sentence.constant.ts
export enum HskLevel {
  HSK1 = 'HSK1',
  HSK2 = 'HSK2',
  HSK3 = 'HSK3',
  HSK4 = 'HSK4',
  HSK5 = 'HSK5',
  HSK6 = 'HSK6',
}

export const SENTENCE_TABLE_NAME = 'long_sentences';
export const SENTENCE_VOCABULARY_TABLE_NAME = 'sentence_vocabulary';
```

---

## 3. API Endpoints

### 3.1 Base URL

```
/api/v1/sentences
```

### 3.2 Endpoints

| Method | Endpoint                      | Mô tả                  | Auth Required |
| ------ | ----------------------------- | ---------------------- | ------------- |
| GET    | `/api/v1/sentences`           | Danh sách (phân trang) | ✅            |
| POST   | `/api/v1/sentences`           | Tạo mới                | ✅ (Admin)    |
| GET    | `/api/v1/sentences/:id`       | Chi tiết               | ✅            |
| PUT    | `/api/v1/sentences/:id`       | Cập nhật toàn phần     | ✅ (Admin)    |
| DELETE | `/api/v1/sentences/:id`       | Xóa (soft-delete)      | ✅ (Admin)    |

### 3.3 Query Parameters (List)

| Param      | Type     | Default     | Mô tả                 |
| ---------- | -------- | ----------- | --------------------- |
| `page`     | number   | 1           | Trang hiện tại        |
| `pageSize` | number   | 20          | Số item mỗi trang     |
| `sortBy`   | string   | orderIndex  | Trường sắp xếp        |
| `sortDir`  | asc/desc | asc         | Hướng sắp xếp         |
| `q`        | string   | -           | Từ khóa tìm kiếm      |
| `level`    | string   | -           | Lọc theo cấp độ HSK   |

---

## 4. DTOs

### 4.1 CreateSentenceDto

```typescript
// src/modules/sentence/dto/create-sentence.dto.ts
export class CreateSentenceDto {
  vietnamese: string;       // @IsNotEmpty, @MaxLength(500)
  chinese: string;          // @IsNotEmpty, @MaxLength(500)
  pinyin: string;           // @IsNotEmpty, @MaxLength(500)
  meaning: string;          // @IsNotEmpty, @IsString
  hint?: string;            // @IsOptional, @IsString, @MaxLength(255)
  level: HskLevel;          // @IsNotEmpty, @IsEnum(HskLevel)
  orderIndex?: number;      // @IsOptional, @IsInt, @Min(0)
}
```

### 4.2 UpdateSentenceDto

```typescript
// src/modules/sentence/dto/update-sentence.dto.ts
export class UpdateSentenceDto {
  vietnamese?: string;      // @IsOptional, @MaxLength(500)
  chinese?: string;         // @IsOptional, @MaxLength(500)
  pinyin?: string;          // @IsOptional, @MaxLength(500)
  meaning?: string;         // @IsOptional, @IsString
  hint?: string;            // @IsOptional, @IsString, @MaxLength(255)
  level?: HskLevel;         // @IsOptional, @IsEnum(HskLevel)
  orderIndex?: number;      // @IsOptional, @IsInt, @Min(0)
}
```

### 4.3 ListSentenceQueryDto

```typescript
// src/modules/sentence/dto/list-sentence-query.dto.ts
export class ListSentenceQueryDto {
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @IsOptional() @IsString() sortBy?: string = 'orderIndex';
  @IsOptional() @IsIn(['asc', 'desc']) sortDir?: 'asc' | 'desc' = 'asc';
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsEnum(HskLevel) level?: HskLevel;
}
```

### 4.4 DetailSentenceParamDto

```typescript
// src/modules/sentence/dto/detail-sentence-param.dto.ts
export class DetailSentenceParamDto {
  @IsUUID() id: string;
}
```

### 4.5 Response DTO

```typescript
// src/modules/sentence/dto/response/sentence-response.dto.ts
export class SentenceResponseDto {
  id: string;
  vietnamese: string;
  chinese: string;
  pinyin: string;
  meaning: string;
  hint: string | null;
  level: HskLevel;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SentenceListResponseDto {
  items: SentenceResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 5. Service Layer

### 5.1 SentenceService Methods

**create(dto: CreateSentenceDto)**
- Validate DTO
- Check duplicate vietnamese in same level
- Set orderIndex if not provided (auto increment)
- Save entity via repository
- Return created entity

**update(id: string, dto: UpdateSentenceDto)**
- Validate DTO
- Find existing entity by id
- Check duplicate vietnamese in same level if vietnamese/level changed
- Update fields and save
- Return updated entity

**findAll(query: ListSentenceQueryDto)**
- Validate query params
- Build query with filters (q, level) and pagination
- Apply sorting (default: orderIndex ASC)
- Return paginated result

**findById(id: string)**
- Find entity by id
- Throw NotFound if not exists
- Return entity

**delete(id: string)**
- Find entity by id
- Soft delete (set deletedAt)
- Return void

### 5.2 Business Rules

| Rule ID | Mô tả                                              | Priority |
| ------- | -------------------------------------------------- | -------- |
| BR-001  | Vietnamese không được trùng trong cùng level       | HIGH     |
| BR-002  | Chỉ Admin mới được tạo, sửa, xóa câu dài          | HIGH     |
| BR-003  | Student chỉ được xem danh sách và chi tiết         | HIGH     |
| BR-004  | Sort mặc định: orderIndex ASC                      | MEDIUM   |
| BR-005  | Pagination bắt buộc, max 100 item/trang           | MEDIUM   |

---

## 6. Repository Layer

### 6.1 SentenceRepository

```typescript
// src/modules/sentence/repositories/sentence.repository.ts
@Injectable()
export class SentenceRepository extends BaseRepository<LongSentenceEntity> {
  constructor(
    @InjectRepository(LongSentenceEntity)
    repository: Repository<LongSentenceEntity>,
  ) {
    super(repository);
  }

  async findAllWithPagination(query: ListSentenceQueryDto): Promise<PaginatedResult<LongSentenceEntity>>;
  async findById(id: string): Promise<LongSentenceEntity | null>;
  async findByVietnameseAndLevel(vietnamese: string, level: HskLevel): Promise<LongSentenceEntity | null>;
  async findMaxOrderIndex(level: HskLevel): Promise<number>;
  async softDelete(id: string): Promise<void>;
}
```

---

## 7. Controller Layer

### 7.1 SentenceController

```typescript
// src/modules/sentence/sentence.controller.ts
@Controller('sentences')
@ApiTags('Sentence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SentenceController {
  constructor(private readonly sentenceService: SentenceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateSentenceDto): Promise<ApiResponse<SentenceResponseDto>>;

  @Get()
  async findAll(@Query() query: ListSentenceQueryDto): Promise<ApiResponse<SentenceListResponseDto>>;

  @Get(':id')
  async findOne(@Param() param: DetailSentenceParamDto): Promise<ApiResponse<SentenceResponseDto>>;

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param() param: DetailSentenceParamDto,
    @Body() dto: UpdateSentenceDto,
  ): Promise<ApiResponse<SentenceResponseDto>>;

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  async remove(@Param() param: DetailSentenceParamDto): Promise<void>;
}
```

---

## 8. Module Structure

### 8.1 Directory Tree

```
src/
├── database/
│   └── entities/
│       └── long-sentence.entity.ts
├── modules/
│   └── sentence/
│       ├── sentence.controller.ts
│       ├── sentence.module.ts
│       ├── dto/
│       │   ├── create-sentence.dto.ts
│       │   ├── update-sentence.dto.ts
│       │   ├── list-sentence-query.dto.ts
│       │   ├── detail-sentence-param.dto.ts
│       │   └── response/
│       │       └── sentence-response.dto.ts
│       ├── repositories/
│       │   └── sentence.repository.ts
│       └── services/
│           └── sentence.service.ts
└── common/
    ├── constants/
    │   └── sentence.constant.ts
    └── repositories/
        └── base.repository.ts
```

---

## 9. Error Handling

### 9.1 Custom Exceptions

| Exception                     | HTTP Status | Error Code             |
| ----------------------------- | ----------- | ---------------------- |
| `SentenceNotFoundException`   | 404         | `SENTENCE_NOT_FOUND`   |
| `DuplicateSentenceException`  | 409         | `DUPLICATE_SENTENCE`   |
| `UnauthorizedException`       | 401         | `UNAUTHORIZED`         |
| `ForbiddenException`           | 403         | `FORBIDDEN`            |

### 9.2 Error Response Format

```json
{
  "statusCode": 404,
  "message": "Sentence not found",
  "error": "Not Found",
  "code": "SENTENCE_NOT_FOUND",
  "details": {
    "id": "uuid-string"
  }
}
```

---

## 10. Validation & Constraints

### 10.1 Field Validations

| Field       | Rules                                      |
| ----------- | ------------------------------------------ |
| vietnamese  | required, max 500 chars, unique in level   |
| chinese     | required, max 500 chars                    |
| pinyin      | required, max 500 chars                    |
| meaning     | required, is string                        |
| hint        | optional, max 255 chars                    |
| level       | required, must be valid HskLevel enum     |
| orderIndex  | optional, default auto-increment, >= 0    |

### 10.2 Business Validations

- [ ] Kiểm tra vietnamese không trùng trong cùng level khi tạo/cập nhật
- [ ] Kiểm tra bản ghi tồn tại trước khi thao tác
- [ ] Kiểm tra quyền Admin cho các action CRUD
- [ ] Validate orderIndex >= 0

---

## 11. Indexing Strategy

### 11.1 Database Indexes

```sql
-- Index for level filter
CREATE INDEX idx_long_sentences_level ON long_sentences(level);

-- Index for sorting
CREATE INDEX idx_long_sentences_order_index ON long_sentences(order_index);

-- Unique constraint: vietnamese + level (no duplicate in same level)
CREATE UNIQUE INDEX idx_long_sentences_vietnamese_level ON long_sentences(vietnamese, level) WHERE deleted_at IS NULL;

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_long_sentences_fulltext ON long_sentences USING gin(to_tsvector('chinese', vietnamese || ' ' || chinese || ' ' || pinyin));
```

---

## 12. Role Permissions

### 12.1 Permission Matrix

| Endpoint                  | Admin | Student | Guest |
| ------------------------- | ----- | ------- | ----- |
| GET /sentences            | ✅    | ✅      | ❌    |
| GET /sentences/:id        | ✅    | ✅      | ❌    |
| POST /sentences           | ✅    | ❌      | ❌    |
| PUT /sentences/:id        | ✅    | ❌      | ❌    |
| DELETE /sentences/:id     | ✅    | ❌      | ❌    |
