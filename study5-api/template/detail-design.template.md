# 📋 Detail Design: {ModuleName}

## 1. Tổng quan Module

### 1.1 Mô tả

{Mô tả ngắn gọn chức năng chính của module}

### 1.2 Mục tiêu

- {Mục tiêu/thành quả mong đợi khi hoàn thành module}

### 1.3 Phạm vi

- **Trong phạm vi:** {Các chức năng thuộc module}
- **Ngoài phạm vi:** {Các chức năng không thuộc module này}

---

## 2. Database Schema

### 2.1 Entity Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                    {ModuleName}                              │
├─────────────────────────────────────────────────────────────┤
│  id: UUID (PK)                                               │
│  name: string                                                │
│  description: string (nullable)                             │
│  status: enum                                               │
│  createdAt: timestamp                                       │
│  updatedAt: timestamp                                        │
│  deletedAt: timestamp (nullable, soft-delete)               │
├─────────────────────────────────────────────────────────────┤
│  Relations:                                                  │
│  - 1:N → RelatedEntity                                      │
│  - N:1 → ParentEntity                                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Entity Fields

#### {ModuleName}Entity

| Field         | Type         | Constraints        | Mô tả                |
| ------------- | ------------ | ------------------ | -------------------- |
| `id`          | UUID         | PK, auto-generated | Khóa chính           |
| `name`        | VARCHAR(255) | NOT NULL, UNIQUE   | Tên                  |
| `description` | TEXT         | NULLABLE           | Mô tả                |
| `status`      | ENUM         | NOT NULL, DEFAULT  | Trạng thái           |
| `createdAt`   | TIMESTAMP    | auto               | Thời gian tạo        |
| `updatedAt`   | TIMESTAMP    | auto               | Thời gian cập nhật   |
| `deletedAt`   | TIMESTAMP    | NULLABLE           | Thời gian xóa (soft) |

### 2.3 Enums

```typescript
// src/common/constants/{module}.constant.ts
export enum {ModuleName}Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export const {MODULE_NAME}_TABLE_NAME = '{module_names}';
```

---

## 3. API Endpoints

### 3.1 Base URL

```
/api/v1/{module-names}
```

### 3.2 Endpoints

| Method | Endpoint                     | Mô tả                  | Auth Required |
| ------ | ---------------------------- | ---------------------- | ------------- |
| GET    | `/api/v1/{module-names}`     | Danh sách (phân trang) | ✅            |
| POST   | `/api/v1/{module-names}`     | Tạo mới                | ✅            |
| GET    | `/api/v1/{module-names}/:id` | Chi tiết               | ✅            |
| PUT    | `/api/v1/{module-names}/:id` | Cập nhật toàn phần     | ✅            |
| PATCH  | `/api/v1/{module-names}/:id` | Cập nhật từng phần     | ✅            |
| DELETE | `/api/v1/{module-names}/:id` | Xóa (soft-delete)      | ✅            |

### 3.3 Query Parameters (List)

| Param      | Type     | Default   | Mô tả               |
| ---------- | -------- | --------- | ------------------- |
| `page`     | number   | 1         | Trang hiện tại      |
| `pageSize` | number   | 20        | Số item mỗi trang   |
| `sortBy`   | string   | createdAt | Trường sắp xếp      |
| `sortDir`  | asc/desc | desc      | Hướng sắp xếp       |
| `q`        | string   | -         | Từ khóa tìm kiếm    |
| `status`   | string   | -         | Lọc theo trạng thái |
| `fromDate` | date     | -         | Lọc từ ngày         |
| `toDate`   | date     | -         | Lọc đến ngày        |

---

## 4. DTOs

### 4.1 Create{ModuleName}Dto

```typescript
// src/modules/{module}/dto/create-{module-name}.dto.ts
export class Create{ModuleName}Dto {
  name: string;           // @IsNotEmpty, @MaxLength(255)
  description?: string;    // @IsOptional, @IsString
  status?: {ModuleName}Status; // @IsOptional, @IsEnum({ModuleName}Status)
}
```

### 4.2 Update{ModuleName}Dto

```typescript
// src/modules/{module}/dto/update-{module-name}.dto.ts
export class Update{ModuleName}Dto {
  name?: string;          // @IsOptional, @MaxLength(255)
  description?: string;   // @IsOptional, @IsString
  status?: {ModuleName}Status; // @IsOptional, @IsEnum({ModuleName}Status)
}
```

### 4.3 List{ModuleName}QueryDto

```typescript
// src/modules/{module}/dto/list-{module-name}-query.dto.ts
export class List{ModuleName}QueryDto {
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number = 20;
  @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortDir?: 'asc' | 'desc' = 'desc';
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsEnum({ModuleName}Status) status?: {ModuleName}Status;
  @IsOptional() @IsDateString() fromDate?: string;
  @IsOptional() @IsDateString() toDate?: string;
}
```

### 4.4 Detail{ModuleName}ParamDto

```typescript
// src/modules/{module}/dto/detail-{module-name}-param.dto.ts
export class Detail{ModuleName}ParamDto {
  @IsUUID() id: string;
}
```

### 4.5 Response DTO

```typescript
// src/modules/{module}/dto/response/{module-name}-response.dto.ts
export class {ModuleName}ResponseDto {
  id: string;
  name: string;
  description: string | null;
  status: {ModuleName}Status;
  createdAt: Date;
  updatedAt: Date;
}

export class {ModuleName}ListResponseDto {
  items: {ModuleName}ResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 5. Service Layer

### 5.1 {ModuleName}Service Methods

-Service 1
DESCIPTION: Chi tiết các bước. Ko code example
-Service 1
DESCIPTION: Chi tiết các bước. Ko code example

### 5.2 Business Rules

| Rule ID | Mô tả                                                  | Priority |
| ------- | ------------------------------------------------------ | -------- |
| BR-001  | Tên không được trùng lặp                               | HIGH     |
| BR-002  | Chỉ có thể activate/deactivate bản ghi ACTIVE/INACTIVE | MEDIUM   |
| BR-003  | Xóa bản ghi đang có relation → reject                  | HIGH     |

---

## 6. Repository Layer

### 6.1 {ModuleName}Repository

```typescript
// src/modules/{module}/repositories/{module-name}.repository.ts
@Injectable()
export class {ModuleName}Repository extends BaseRepository<{ModuleName}Entity> {
  constructor(
    @InjectRepository({ModuleName}Entity)
    repository: Repository<{ModuleName}Entity>,
  ) {
    super(repository);
  }

  async findAllWithPagination(query: List{ModuleName}QueryDto): Promise<PaginatedResult<{ModuleName}Entity>>;
  async findById(id: string): Promise<{ModuleName}Entity | null>;
  async findByName(name: string): Promise<{ModuleName}Entity | null>;
  async softDelete(id: string): Promise<void>;
}
```

---

## 7. Controller Layer

### 7.1 {ModuleName}Controller

```typescript
// src/modules/{module}/{module-name}.controller.ts
@Controller('{module-names}')
@ApiTags('{ModuleName}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class {ModuleName}Controller {
  constructor(private readonly {moduleName}Service: {ModuleName}Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: Create{ModuleName}Dto): Promise<ApiResponse<{ModuleName}ResponseDto>>;

  @Get()
  async findAll(@Query() query: List{ModuleName}QueryDto): Promise<ApiResponse<{ModuleName}ListResponseDto>>;

  @Get(':id')
  async findOne(@Param() param: Detail{ModuleName}ParamDto): Promise<ApiResponse<{ModuleName}ResponseDto>>;

  @Put(':id')
  async update(
    @Param() param: Detail{ModuleName}ParamDto,
    @Body() dto: Update{ModuleName}Dto,
  ): Promise<ApiResponse<{ModuleName}ResponseDto>>;

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() param: Detail{ModuleName}ParamDto): Promise<void>;

  // Action endpoints
  @Post(':id/activate')
  async activate(@Param() param: Detail{ModuleName}ParamDto): Promise<ApiResponse<{ModuleName}ResponseDto>>;

  @Post(':id/deactivate')
  async deactivate(@Param() param: Detail{ModuleName}ParamDto): Promise<ApiResponse<{ModuleName}ResponseDto>>;
}
```

---

## 8. Module Structure

### 8.1 Directory Tree

```
src/
├── database/
│   └── entities/
│       └── {module-name}.entity.ts
├── modules/
│   └── {module}/
│       ├── {module-name}.controller.ts
│       ├── {module-name}.module.ts
│       ├── dto/
│       │   ├── create-{module-name}.dto.ts
│       │   ├── update-{module-name}.dto.ts
│       │   ├── list-{module-name}-query.dto.ts
│       │   ├── detail-{module-name}-param.dto.ts
│       │   └── response/
│       │       └── {module-name}-response.dto.ts
│       ├── repositories/
│       │   └── {module-name}.repository.ts
│       └── services/
│           └── {module-name}.service.ts
└── common/
    ├── constants/
    │   └── {module}.constant.ts
    └── repositories/
        └── base.repository.ts
```

---

## 9. Error Handling

### 9.1 Custom Exceptions

| Exception                          | HTTP Status | Error Code            |
| ---------------------------------- | ----------- | --------------------- |
| `{ModuleName}NotFoundException`    | 404         | `{MODULE}_NOT_FOUND`  |
| `DuplicateNameException`           | 409         | `DUPLICATE_NAME`      |
| `InvalidStatusTransitionException` | 400         | `INVALID_STATUS`      |
| `HasRelatedRecordsException`       | 400         | `HAS_RELATED_RECORDS` |

### 9.2 Error Response Format

```json
{
  "statusCode": 404,
  "message": "{ModuleName} not found",
  "error": "Not Found",
  "code": "{MODULE}_NOT_FOUND",
  "details": {
    "id": "uuid-string"
  }
}
```

---

## 10. Validation & Constraints

### 10.1 Field Validations

| Field       | Rules                                        |
| ----------- | -------------------------------------------- |
| name        | required, max 255 chars, unique              |
| description | optional, max 2000 chars                     |
| status      | optional, default ACTIVE, must be valid enum |

### 10.2 Business Validations

- [ ] Kiểm tra tên không trùng lặp khi tạo/cập nhật
- [ ] Kiểm tra bản ghi tồn tại trước khi thao tác
- [ ] Kiểm tra relation trước khi xóa
- [ ] Validate status transition hợp lệ

---
