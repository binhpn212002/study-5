# 📘 Basic Design – User Saved Vocabulary Module

## 1. Mục tiêu

Cho phép user:

- Lưu từ vựng vào danh sách học sau
- Xem lại danh sách từ đã lưu
- Học theo danh sách cá nhân
- Theo dõi trạng thái học từng từ

## 2. Actors

| Actor | Quyền |
|-------|-------|
| Student | Save/unsave vocab, xem danh sách, lọc, học |
| Admin | Xem tất cả user vocab (quản lý) |

## 3. Data Model

### 3.1 Vocabulary (đã có)

```
Vocabulary {
  id: uuid
  chinese: string
  pinyin: string
  meaning: string
  level: HskLevel
  createdAt: datetime
  updatedAt: datetime
}
```

### 3.2 UserVocabulary (core table)

```
UserVocabulary {
  id: uuid
  userId: uuid
  vocabId: uuid

  isSaved: boolean

  status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED'

  createdAt: datetime
  updatedAt: datetime
}
```

## 4. Business Rules

### 4.1 Unique constraint

1 user chỉ có 1 record cho 1 vocab

```
UNIQUE(userId, vocabId)
```

### 4.2 Save behavior

Khi user save vocab:

- Nếu chưa tồn tại → create mới với `isSaved = true`
- Nếu tồn tại → update `isSaved = true`

### 4.3 Remove behavior

Không delete hard

- Chỉ update `isSaved = false`

### 4.4 Default status

Khi save mới → status mặc định = `NEW`

## 5. API Design

### 5.1 Save vocabulary

```
POST /user-vocab/save
```

### 5.2 Remove vocabulary

```
DELETE /user-vocab/remove/:vocabId
```

### 5.3 List saved vocabularies

```
GET /user-vocab
```

Query params:

| Param | Type | Mô tả |
|-------|------|--------|
| page | number | phân trang |
| pageSize | number | số item |
| level | HskLevel | lọc theo level |
| status | VocabStatus | lọc theo trạng thái |

Response:

```
{
  "data": [
    {
      "id": "uuid",
      "vocabId": "uuid",
      "chinese": "苹果",
      "pinyin": "píngguǒ",
      "meaning": "Táo",
      "level": "HSK1",
      "status": "NEW",
      "savedAt": "timestamp"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 50
  }
}
```

### 5.4 Update learning status

```
PATCH /user-vocab/:vocabId/status
```

Body:

```
{
  "status": "LEARNING"
}
```

## 6. Enums

```
enum HskLevel {
  HSK1 = 'HSK1',
  HSK2 = 'HSK2',
  HSK3 = 'HSK3',
  HSK4 = 'HSK4',
  HSK5 = 'HSK5',
  HSK6 = 'HSK6'
}

enum VocabStatus {
  NEW = 'NEW',
  LEARNING = 'LEARNING',
  REVIEWING = 'REVIEWING',
  MASTERED = 'MASTERED'
}
```

## 7. Final API Summary

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | /user-vocab/save | Lưu từ vựng |
| DELETE | /user-vocab/remove/:vocabId | Bỏ lưu từ vựng |
| GET | /user-vocab | Danh sách đã lưu (filter/pagination) |
| PATCH | /user-vocab/:vocabId/status | Cập nhật trạng thái học |
