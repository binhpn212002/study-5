# 📋 Plan: LongSentence Module (HSK Long Sentence)

## 1. Tổng quan

- **Module**: LongSentence (Sentence)
- **Mục tiêu**: Quản lý câu dài tiếng Trung theo cấp độ HSK, hỗ trợ Admin CRUD và Student xem danh sách/chi tiết
- **Entity**: LongSentenceEntity
- **Base URL**: `/api/v1/sentences`

---

## 2. Cấu trúc thư mục cần tạo

```
src/
├── database/
│   └── entities/
│       └── long-sentence.entity.ts
├── common/
│   ├── constants/
│   │   └── sentence.constant.ts      # Enum HskLevel, table names
│   └── repositories/
│       └── base.repository.ts        # BaseRepository (nếu chưa có)
└── modules/
    └── sentence/
        ├── sentence.controller.ts
        ├── sentence.module.ts
        ├── dto/
        │   ├── create-sentence.dto.ts
        │   ├── update-sentence.dto.ts
        │   ├── list-sentence-query.dto.ts
        │   ├── detail-sentence-param.dto.ts
        │   └── response/
        │       └── sentence-response.dto.ts
        ├── repositories/
        │   └── sentence.repository.ts
        └── services/
            └── sentence.service.ts
```

---

## 3. Thứ tự phát triển

### Phase 1: Chuẩn bị (Infrastructure)
- [ ] Kiểm tra và tạo `src/common/repositories/base.repository.ts` (nếu chưa tồn tại)
- [ ] Tạo `src/common/constants/sentence.constant.ts` với enum `HskLevel` và các hằng số table

### Phase 2: Entity
- [ ] Tạo `src/database/entities/long-sentence.entity.ts`
  - UUID primary key
  - Fields: vietnamese, chinese, pinyin, meaning, hint, level, orderIndex
  - Soft delete (deletedAt)
  - Indexes: level, orderIndex, unique (vietnamese + level)

### Phase 3: Repository Layer
- [ ] Tạo `src/modules/sentence/repositories/sentence.repository.ts`
  - Kế thừa BaseRepository
  - Methods: findAllWithPagination, findById, findByVietnameseAndLevel, findMaxOrderIndex, softDelete

### Phase 4: DTOs
- [ ] Tạo `src/modules/sentence/dto/create-sentence.dto.ts`
- [ ] Tạo `src/modules/sentence/dto/update-sentence.dto.ts`
- [ ] Tạo `src/modules/sentence/dto/list-sentence-query.dto.ts`
- [ ] Tạo `src/modules/sentence/dto/detail-sentence-param.dto.ts`
- [ ] Tạo `src/modules/sentence/dto/response/sentence-response.dto.ts`

### Phase 5: Service Layer
- [ ] Tạo `src/modules/sentence/services/sentence.service.ts`
  - create(): Validate, check duplicate, auto orderIndex
  - update(): Validate, check duplicate if changed
  - findAll(): Pagination, filter (q, level), sort
  - findById(): Get by ID, throw NotFound
  - delete(): Soft delete

### Phase 6: Controller Layer
- [ ] Tạo `src/modules/sentence/sentence.controller.ts`
  - GET /sentences (list)
  - POST /sentences (create - Admin only)
  - GET /sentences/:id (detail)
  - PUT /sentences/:id (update - Admin only)
  - DELETE /sentences/:id (delete - Admin only)

### Phase 7: Module Registration
- [ ] Tạo `src/modules/sentence/sentence.module.ts`
- [ ] Đăng ký module trong `app.module.ts`

---

## 4. Chi tiết kỹ thuật

### 4.1 Entity Fields

| Field       | Type         | Constraints                  |
| ----------- | ------------ | ---------------------------- |
| id          | UUID         | PK, auto-generated           |
| vietnamese  | VARCHAR(500) | NOT NULL                     |
| chinese     | VARCHAR(500) | NOT NULL                     |
| pinyin      | VARCHAR(500) | NOT NULL                     |
| meaning     | TEXT         | NOT NULL                     |
| hint        | VARCHAR(255) | NULLABLE                     |
| level       | ENUM         | HSK1-HSK6                    |
| orderIndex  | INT          | DEFAULT 0                    |
| createdAt   | TIMESTAMP    | auto                         |
| updatedAt   | TIMESTAMP    | auto                         |
| deletedAt   | TIMESTAMP    | NULLABLE (soft-delete)       |

### 4.2 Enum HskLevel

```typescript
export enum HskLevel {
  HSK1 = 'HSK1',
  HSK2 = 'HSK2',
  HSK3 = 'HSK3',
  HSK4 = 'HSK4',
  HSK5 = 'HSK5',
  HSK6 = 'HSK6',
}
```

### 4.3 API Endpoints

| Method | Endpoint                   | Mô tả               | Auth        |
| ------ | --------------------------- | ------------------- | ----------- |
| GET    | /api/v1/sentences          | Danh sách (phân trang) | JwtAuth    |
| POST   | /api/v1/sentences          | Tạo mới            | Admin       |
| GET    | /api/v1/sentences/:id      | Chi tiết           | JwtAuth     |
| PUT    | /api/v1/sentences/:id      | Cập nhật           | Admin       |
| DELETE | /api/v1/sentences/:id      | Xóa (soft-delete)  | Admin       |

### 4.4 Business Rules

| Rule ID | Mô tả                                          | Priority |
| ------- | ---------------------------------------------- | -------- |
| BR-001  | Vietnamese không được trùng trong cùng level   | HIGH     |
| BR-002  | Chỉ Admin mới được tạo, sửa, xóa              | HIGH     |
| BR-003  | Student chỉ được xem danh sách và chi tiết     | HIGH     |
| BR-004  | Sort mặc định: orderIndex ASC                 | MEDIUM   |
| BR-005  | Pagination bắt buộc, max 100 item/trang        | MEDIUM   |

### 4.5 Query Parameters (List)

| Param      | Type     | Default     | Mô tả                 |
| ---------- | -------- | ----------- | --------------------- |
| page       | number   | 1           | Trang hiện tại        |
| pageSize   | number   | 20          | Số item mỗi trang     |
| sortBy     | string   | orderIndex  | Trường sắp xếp        |
| sortDir    | asc/desc | asc         | Hướng sắp xếp         |
| q          | string   | -           | Từ khóa tìm kiếm      |
| level      | string   | -           | Lọc theo cấp độ HSK   |

---

## 5. Files cần tạo/mở rộng

### Tạo mới

| File | Mô tả |
| ---- | ----- |
| `src/common/constants/sentence.constant.ts` | Enum và constants |
| `src/database/entities/long-sentence.entity.ts` | TypeORM entity |
| `src/modules/sentence/sentence.module.ts` | NestJS module |
| `src/modules/sentence/sentence.controller.ts` | REST endpoints |
| `src/modules/sentence/services/sentence.service.ts` | Business logic |
| `src/modules/sentence/repositories/sentence.repository.ts` | Data access |
| `src/modules/sentence/dto/create-sentence.dto.ts` | Create DTO |
| `src/modules/sentence/dto/update-sentence.dto.ts` | Update DTO |
| `src/modules/sentence/dto/list-sentence-query.dto.ts` | Query DTO |
| `src/modules/sentence/dto/detail-sentence-param.dto.ts` | Param DTO |
| `src/modules/sentence/dto/response/sentence-response.dto.ts` | Response DTOs |

### Mở rộng (nếu cần)

| File | Thay đổi |
| ---- | -------- |
| `src/common/repositories/base.repository.ts` | Kiểm tra tồn tại, tạo nếu chưa có |
| `src/app.module.ts` | Import SentenceModule |

---

## 6. Dependencies

- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - ORM
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `@nestjs/swagger` - API documentation (tùy chọn)

---

## 7. Ghi chú

- Sử dụng soft-delete (deletedAt) thay vì hard-delete
- BaseRepository đã có sẵn trong `src/common/repositories/`, kiểm tra trước khi tạo mới
- Thứ tự tạo: Constants → Entity → Repository → DTOs → Service → Controller → Module
- Các exception tùy chỉnh: SentenceNotFoundException, DuplicateSentenceException
