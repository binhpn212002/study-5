# 📋 Plan: Vocabulary Module

## 1. Tổng quan

| Thông tin | Chi tiết |
|-----------|----------|
| **Module** | Vocabulary |
| **Module cha** | - |
| **Priority** | HIGH |
| **Phạm vi** | CRUD từ vựng, tìm kiếm, xem chi tiết, học theo HSK level |
| **Ngoài phạm vi** | Flashcard, quiz, spaced repetition, user progress tracking |

---

## 2. Mục tiêu phát triển

- [x] CRUD từ vựng tiếng Trung theo cấp độ HSK 1-6
- [x] Hỗ trợ Student học từ vựng theo level
- [x] Tìm kiếm từ vựng nhanh chóng (theo chinese, pinyin, vietnameseMeaning)
- [x] Hiển thị pinyin, nghĩa tiếng Việt và câu ví dụ
- [x] Soft-delete cho từ vựng

---

## 3. Cấu trúc thư mục

```
src/
├── database/
│   └── entities/
│       └── vocabulary.entity.ts   # VocabularyEntity
├── common/
│   ├── constants/
│   │   └── vocabulary.constant.ts # HskLevel enum, VOCABULARY_TABLE_NAME
│   └── exceptions/
│       └── vocabulary.exceptions.ts
└── modules/
    └── vocabulary/
        ├── vocabulary.controller.ts
        ├── vocabulary.module.ts
        ├── dto/
        │   ├── create-vocabulary.dto.ts
        │   ├── update-vocabulary.dto.ts
        │   ├── list-vocabulary-query.dto.ts
        │   ├── detail-vocabulary-param.dto.ts
        │   ├── vocabulary-by-level-param.dto.ts
        │   └── response/
        │       └── vocabulary-response.dto.ts
        ├── repositories/
        │   └── vocabulary.repository.ts
        └── services/
            └── vocabulary.service.ts
```

---

## 4. Thứ tự phát triển

### Phase 1: Chuẩn bị (Foundation)

- [x] 1.1 Tạo enum `HskLevel` và constants - `src/common/constants/vocabulary.constant.ts`
- [x] 1.2 Kiểm tra `BaseRepository` đã có chưa - `src/common/repositories/base.repository.ts`
- [x] 1.3 Tạo custom exceptions - `src/common/exceptions/vocabulary.exceptions.ts`

### Phase 2: Entity & Database

- [x] 2.1 Tạo `VocabularyEntity` - `src/database/entities/vocabulary.entity.ts`

### Phase 3: Repository Layer

- [x] 3.1 Tạo `VocabularyRepository` - `src/modules/vocabulary/repositories/vocabulary.repository.ts`

### Phase 4: DTOs

- [x] 4.1 Tạo `CreateVocabularyDto` - `src/modules/vocabulary/dto/create-vocabulary.dto.ts`
- [x] 4.2 Tạo `UpdateVocabularyDto` - `src/modules/vocabulary/dto/update-vocabulary.dto.ts`
- [x] 4.3 Tạo `ListVocabularyQueryDto` - `src/modules/vocabulary/dto/list-vocabulary-query.dto.ts`
- [x] 4.4 Tạo `DetailVocabularyParamDto` - `src/modules/vocabulary/dto/detail-vocabulary-param.dto.ts`
- [x] 4.5 Tạo `VocabularyByLevelParamDto` - `src/modules/vocabulary/dto/vocabulary-by-level-param.dto.ts`
- [x] 4.6 Tạo Response DTOs - `src/modules/vocabulary/dto/response/vocabulary-response.dto.ts`

### Phase 5: Service Layer

- [x] 5.1 Tạo `VocabularyService` với các methods:
  - `create()`, `findAll()`, `findById()`, `update()`, `remove()`, `findByLevel()`, `getAllLevels()`

### Phase 6: Controller Layer

- [x] 6.1 Tạo `VocabularyController` - `src/modules/vocabulary/vocabulary.controller.ts`

### Phase 7: Module Registration

- [x] 7.1 Tạo `VocabularyModule` - `src/modules/vocabulary/vocabulary.module.ts`
- [x] 7.2 Import vào `AppModule` - `src/app.module.ts`

---

## 5. API Endpoints

| Method | Endpoint | Auth | Roles | Status |
|--------|----------|------|-------|--------|
| GET | `/api/v1/vocabularies` | ✅ | Admin, Student | ✅ |
| POST | `/api/v1/vocabularies` | ✅ | Admin | ✅ |
| GET | `/api/v1/vocabularies/:id` | ✅ | Admin, Student | ✅ |
| PUT | `/api/v1/vocabularies/:id` | ✅ | Admin | ✅ |
| PATCH | `/api/v1/vocabularies/:id` | ✅ | Admin | ✅ |
| DELETE | `/api/v1/vocabularies/:id` | ✅ | Admin | ✅ |
| GET | `/api/v1/vocabularies/levels` | ❌ | - | ✅ |
| GET | `/api/v1/vocabularies/by-level/:level` | ✅ | Admin, Student | ✅ |

---

## 6. Business Rules

| Rule ID | Mô tả | Priority | Status |
|---------|-------|----------|--------|
| BR-001 | Từ tiếng Trung (chinese) không được trùng lặp | HIGH | ✅ |
| BR-002 | Pinyin phải hợp lệ theo format pinyin | MEDIUM | - |
| BR-003 | Chỉ Admin mới được thêm/sửa/xóa từ vựng | HIGH | ✅ |
| BR-004 | Student chỉ được xem và học từ vựng | HIGH | ✅ |

---

## 7. Dependencies & Prerequisites

- [x] Kiểm tra `typeorm` đã được cài đặt
- [x] Kiểm tra `class-validator`, `class-transformer` đã được cài đặt
- [x] Kiểm tra `JwtAuthGuard` đã tồn tại trong `src/common/guards/`
- [x] Kiểm tra `Roles` decorator đã tồn tại trong `src/common/decorators/`
- [x] Kiểm tra `ListResponseDto` helper đã tồn tại trong `src/common/`

---

## 8. Notes

- Entity sử dụng soft-delete (xoá mềm với `deletedAt`)
- Validation được xử lý bởi `class-validator` ở tầng Controller/DTO
- Service chỉ xử lý business logic, không validate lại DTO
- Repository kế thừa từ `BaseRepository`
- Response format theo chuẩn: `{ data: [], total, page, limit }` cho list
- Sử dụng `UserRole.ADMIN` và `UserRole.USER` (không có Student role riêng)

---

## 9. Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1: Foundation | 3 | Low |
| Phase 2: Entity | 1 | Low |
| Phase 3: Repository | 1 | Medium |
| Phase 4: DTOs | 6 | Low |
| Phase 5: Service | 1 (8 methods) | High |
| Phase 6: Controller | 1 | Medium |
| Phase 7: Module | 2 | Low |

**Tổng: ~15 files, ~500-700 dòng code**
