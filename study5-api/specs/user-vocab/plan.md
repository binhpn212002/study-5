# 📋 Plan: UserVocabulary Module

## 1. Module Overview

**Module:** `user-vocab` (User Saved Vocabulary)
**Base URL:** `/api/v1/user-vocab`
**Admin Base URL:** `/api/v1/admin/user-vocab`

Cho phép user lưu/bỏ lưu từ vựng, theo dõi trạng thái học và xem danh sách từ đã lưu.

---

## 2. Directory Structure

```
src/
├── database/
│   └── entities/
│       └── user-vocabulary.entity.ts          # UserVocabularyEntity
├── common/
│   ├── constants/
│   │   ├── vocab-status.constant.ts           # VocabStatus enum
│   │   ├── hsk.constant.ts                    # HskLevel enum, USER_VOCABULARY_TABLE_NAME
│   │   └── user-vocab.constants.ts           # Error codes, messages
│   ├── exceptions/
│   │   └── user-vocab.exceptions.ts           # Custom exceptions
│   └── repositories/
│       └── base.repository.ts                  # BaseRepository (if not exists)
└── modules/
    └── user-vocab/
        ├── user-vocab.module.ts
        ├── user-vocab.controller.ts           # Student endpoints
        ├── admin-user-vocab.controller.ts     # Admin endpoints
        ├── dto/
        │   ├── save-vocabulary.dto.ts
        │   ├── update-vocab-status.dto.ts
        │   ├── list-user-vocab-query.dto.ts
        │   ├── detail-user-vocab-param.dto.ts
        │   └── response/
        │       └── user-vocab-response.dto.ts
        ├── repositories/
        │   └── user-vocab.repository.ts
        └── services/
            └── user-vocab.service.ts
```

---

## 3. Implementation Steps

### Step 1: Common Components (Shared)

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 1.1 | `src/common/constants/vocab-status.constant.ts` | VocabStatus enum (NEW, LEARNING, REVIEWING, MASTERED) | HIGH |
| 1.2 | `src/common/constants/hsk.constant.ts` | HskLevel enum + USER_VOCABULARY_TABLE_NAME | HIGH |
| 1.3 | `src/common/constants/user-vocab.constants.ts` | Error codes & messages | MEDIUM |
| 1.4 | `src/common/exceptions/user-vocab.exceptions.ts` | UserVocabNotFoundException, VocabularyNotFoundException, InvalidStatusTransitionException | HIGH |

### Step 2: Database Entity

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 2.1 | `src/database/entities/user-vocabulary.entity.ts` | UserVocabularyEntity với fields: id, userId, vocabId, isSaved, status, createdAt, updatedAt | HIGH |

### Step 3: Repository Layer

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 3.1 | `src/common/repositories/base.repository.ts` | BaseRepository (nếu chưa tồn tại) | HIGH |
| 3.2 | `src/modules/user-vocab/repositories/user-vocab.repository.ts` | findByUserIdAndVocabId, findAllWithPagination, findAllAdminWithPagination, upsert | HIGH |

### Step 4: DTOs

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 4.1 | `src/modules/user-vocab/dto/save-vocabulary.dto.ts` | SaveVocabularyDto (vocabId) | HIGH |
| 4.2 | `src/modules/user-vocab/dto/update-vocab-status.dto.ts` | UpdateVocabStatusDto (status) | HIGH |
| 4.3 | `src/modules/user-vocab/dto/list-user-vocab-query.dto.ts` | ListUserVocabQueryDto (page, pageSize, sortBy, sortDir, level, status) | HIGH |
| 4.4 | `src/modules/user-vocab/dto/detail-user-vocab-param.dto.ts` | DetailUserVocabParamDto (vocabId) | HIGH |
| 4.5 | `src/modules/user-vocab/dto/response/user-vocab-response.dto.ts` | UserVocabResponseDto, UserVocabListResponseDto | HIGH |

### Step 5: Service Layer

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 5.1 | `src/modules/user-vocab/services/user-vocab.service.ts` | save, remove, findAll, findByVocabId, updateStatus, findAllAdmin | HIGH |

### Step 6: Controller Layer

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 6.1 | `src/modules/user-vocab/user-vocab.controller.ts` | POST /save, DELETE /remove/:vocabId, GET /, GET /:vocabId, PATCH /:vocabId/status | HIGH |
| 6.2 | `src/modules/user-vocab/admin-user-vocab.controller.ts` | GET /admin/user-vocab | HIGH |

### Step 7: Module Registration

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 7.1 | `src/modules/user-vocab/user-vocab.module.ts` | Module khai báo controller, service, repository, imports | HIGH |

### Step 8: Integration

| # | File | Description | Priority |
|---| ---- | ----------- | -------- |
| 8.1 | `src/app.module.ts` | Import UserVocabModule | HIGH |

---

## 4. Files to Create

### 4.1 New Files

```
src/common/constants/vocab-status.constant.ts
src/common/constants/user-vocab.constants.ts
src/common/exceptions/user-vocab.exceptions.ts
src/database/entities/user-vocabulary.entity.ts
src/modules/user-vocab/user-vocab.module.ts
src/modules/user-vocab/user-vocab.controller.ts
src/modules/user-vocab/admin-user-vocab.controller.ts
src/modules/user-vocab/dto/save-vocabulary.dto.ts
src/modules/user-vocab/dto/update-vocab-status.dto.ts
src/modules/user-vocab/dto/list-user-vocab-query.dto.ts
src/modules/user-vocab/dto/detail-user-vocab-param.dto.ts
src/modules/user-vocab/dto/response/user-vocab-response.dto.ts
src/modules/user-vocab/repositories/user-vocab.repository.ts
src/modules/user-vocab/services/user-vocab.service.ts
```

### 4.2 Existing Files to Update

```
src/app.module.ts                                  # Add UserVocabModule import
src/common/constants/hsk.constant.ts               # Add USER_VOCABULARY_TABLE_NAME (if not exists)
```

### 4.3 Dependencies to Check/Create

```
src/common/repositories/base.repository.ts         # Check if exists, create if not
```

---

## 5. API Endpoints Summary

| Method | Endpoint | Description | Auth | Controller |
| ------ | -------- | ----------- | ---- | ---------- |
| POST | `/api/v1/user-vocab/save` | Lưu từ vựng | Student | user-vocab.controller |
| DELETE | `/api/v1/user-vocab/remove/:vocabId` | Bỏ lưu từ vựng | Student | user-vocab.controller |
| GET | `/api/v1/user-vocab` | Danh sách đã lưu | Student | user-vocab.controller |
| GET | `/api/v1/user-vocab/:vocabId` | Chi tiết 1 từ đã lưu | Student | user-vocab.controller |
| PATCH | `/api/v1/user-vocab/:vocabId/status` | Cập nhật trạng thái học | Student | user-vocab.controller |
| GET | `/api/v1/admin/user-vocab` | Danh sách tất cả user vocab | Admin | admin-user-vocab.controller |

---

## 6. Business Rules to Implement

| ID | Rule | Implementation |
| --- | ----- | --------------- |
| BR-001 | 1 user chỉ có 1 record cho 1 vocab (UNIQUE userId + vocabId) | Database unique constraint + upsert logic |
| BR-002 | Remove chỉ set isSaved = false, không hard delete | Repository soft remove |
| BR-003 | Save mới → status mặc định = NEW | Service create logic |
| BR-004 | Student chỉ thấy và thao tác vocab của chính mình | Query filter by userId from token |
| BR-005 | Status transition: NEW → LEARNING → REVIEWING → MASTERED | Service validation |
| BR-006 | Admin có thể xem tất cả user vocab | Admin controller without userId filter |

---

## 7. Validation Checklist

- [ ] vocabId: required, valid UUID, vocab must exist
- [ ] status: required, valid VocabStatus enum
- [ ] Check vocabulary exists before save
- [ ] Check record exists before remove/update status
- [ ] Check user only operates on their own vocab
- [ ] Validate status transition (NEW → LEARNING → REVIEWING → MASTERED)

---

## 8. Notes

1. **Soft Delete**: Remove operation sets `isSaved = false` instead of hard delete
2. **Upsert Pattern**: Save operation uses upsert (insert or update if exists)
3. **Relations**: Entity has N:1 relations to User and Vocabulary entities
4. **Pagination**: All list endpoints return paginated results
5. **Admin Filter**: Admin endpoint supports optional userId filter

---

## 9. Migration (Database)

```sql
CREATE TABLE user_vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  vocab_id UUID NOT NULL REFERENCES vocabularies(id),
  is_saved BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_user_vocab_user_vocab ON user_vocabularies(user_id, vocab_id);
CREATE INDEX idx_user_vocab_user_id ON user_vocabularies(user_id);
CREATE INDEX idx_user_vocab_is_saved ON user_vocabularies(is_saved);
CREATE INDEX idx_user_vocab_status ON user_vocabularies(status);
CREATE INDEX idx_user_vocab_vocab_id ON user_vocabularies(vocab_id);
```
