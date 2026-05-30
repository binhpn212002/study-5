📘 Basic Design – HSK Long Sentence Module (Simplified)

1. Mục tiêu

Module quản lý câu dài tiếng Trung theo cấp độ HSK, phục vụ:

CRUD câu dài (Admin)
Xem và học câu dài (Student)
Lọc và tìm kiếm câu dài 2. Entity
LongSentence {
id: uuid
vietnamese: string
chinese: string
pinyin: string
meaning: string
hint?: string
level: HskLevel
orderIndex: number
createdAt: Date
updatedAt: Date
}
enum HskLevel {
HSK1, HSK2, HSK3, HSK4, HSK5, HSK6
} 3. API Design
3.1 CRUD (Admin)
Method Endpoint Mô tả
POST /api/v1/sentences Tạo câu
GET /api/v1/sentences/:id Chi tiết
PUT /api/v1/sentences/:id Cập nhật
DELETE /api/v1/sentences/:id Xóa
3.2 LIST + FILTER (GỘP 1 ENDPOINT)
GET /api/v1/sentences
Query params:
Param Type Mô tả
page number phân trang
pageSize number số item
q string search câu
level HskLevel lọc theo level
sortBy string orderIndex / createdAt
sortDir asc/desc sắp xếp
Response:
{
"data": [],
"meta": {
"page": 1,
"pageSize": 20,
"total": 100
}
} 4. Business Rules
Không trùng vietnamese trong cùng level
Admin có quyền CRUD
Student chỉ được GET danh sách và chi tiết
Sort mặc định: orderIndex ASC 5. Notes (Optimization)
Dùng index cho level, orderIndex, vietnamese
Full-text search cho q
Pagination bắt buộc để tránh load lớn 6. Final API Summary

Chỉ còn:

POST /sentences
GET /sentences
GET /sentences/:id
PUT /sentences/:id
DELETE /sentences/:id
