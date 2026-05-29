Bạn là Senior Solution Architect và Senior Backend Engineer.

Hãy phân tích và chuyển đổi BASIC DESIGN bên dưới thành TECHNICAL DESIGN chi tiết dành cho backend production-level.

# Yêu cầu chung

- Công nghệ backend: NestJS + TypeScript
- Database: PostgreSQL
- Coding style: clean architecture + module-based
- API style: RESTful
- Validation: class-validator
- ORM: Prisma hoặc TypeORM
- Authentication: JWT
- Response format chuẩn
- Có xử lý transaction nếu cần
- Có logging và error handling
- Có phân tầng rõ ràng:
  - Controller
  - Service
  - Repository
  - DTO
  - Entity
  - Module

# Output cần trả về

## 1. Tổng quan module

- Mô tả chức năng module
- Luồng hoạt động
- Quy tắc nghiệp vụ
- Permission nếu có

---

## 2. Thiết kế Database

Cho từng bảng:

### Table Name

Giải thích mục đích bảng

### Columns

| Column | Type | Nullable | Default | Description |
| ------ | ---- | -------- | ------- | ----------- |

### Indexes

### Relationships

### Constraints

### Soft Delete hay không

### Audit fields

Ví dụ:

- createdAt
- updatedAt
- deletedAt
- createdBy

---

## 3. Cấu trúc thư mục

Sinh full cấu trúc thư mục dạng tree.

### Cấu trúc thư mục chuẩn cho mỗi module

- **controllers/**: Nhận request từ client, validate input cơ bản, gọi service, trả response. Mỗi controller xử lý 1 resource duy nhất.
- **services/**: Chứa logic nghiệp vụ chính, validate nghiệp vụ (ví dụ: kiểm tra quyền, kiểm tra ràng buộc), gọi repository. Service interface tách riêng để dễ mock trong test.
- **repositories/**: Giao tiếp trực tiếp với database. Các method chỉ thực hiện CRUD thuần, không chứa logic nghiệp vụ. Base repository cung cấp các method chung (findAll, findOne, create, update, delete).
- **dto/**: Định nghĩa cấu trúc data request/response. Create DTO cho input khi tạo mới, Update DTO cho input khi cập nhật, Query DTO cho filter/pagination, Response DTO chuẩn hóa format trả về.
- **entities/**: Ánh xạ 1-1 với bảng database. Mỗi entity chứa type definitions cho TypeScript.

### Cấu trúc thư mục cho Common/Shared

- **enums/**: Các enum dùng chung toàn app như Role, Status, SortOrder. Enum giúp tránh magic string và đảm bảo type safety.
- **constants/**: Các hằng số không đổi như mã lỗi, thông báo lỗi, giá trị mặc định.
- **exceptions/**: Tất cả exception tùy chỉnh. Mỗi module có file exception riêng. Base exception đảm bảo format lỗi thống nhất.
- **filters/**: HttpExceptionFilter bắt tất cả exception, format response lỗi theo chuẩn chung, log error ra console/file.
- **guards/**: JwtAuthGuard kiểm tra token JWT. RolesGuard kiểm tra quyền truy cập dựa trên role của user.
- **decorators/**: @CurrentUser lấy user từ token. @Roles khai báo role được phép truy cập endpoint.
- **interceptors/**: TransformInterceptor wrap response vào format chuẩn {success, data, message}.
- **pipes/**: ValidationPipe dùng class-validator để validate request body/query/params trước khi vào controller.
- **middlewares/**: LoggerMiddleware log tất cả request (method, url, response time, status code).
- **helpers/**: ResponseHelper hàm helper tạo response chuẩn, tránh lặp code.
- **types/**: Các type dùng chung, interface cho dependency injection.
- **utils/**: HashUtil băm password với bcrypt, các utility function khác.

### Cấu trúc thư mục cho Database

- **prisma/**: Schema Prisma định nghĩa tất cả bảng, quan hệ, index. PrismaService singleton cung cấp Prisma client instance.
- **repositories/**: BaseRepository chứa các method CRUD chung cho tất cả module, giảm code trùng lặp.
- **seeders/**: Seeder chạy lúc khởi động để tạo dữ liệu mặc định (roles, admin user, config ban đầu).

---

## 4. Thiết kế API

Cho từng API endpoint, trình bày đầy đủ các thành phần:

### API: {Tên API}

#### Thông tin cơ bản

| Thuộc tính         | Giá trị                                |
| ------------------ | -------------------------------------- |
| **Endpoint**       | POST/GET/PUT/DELETE /api/v1/{resource} |
| **Description**    | Mô tả chức năng API                    |
| **Authentication** | Có/Không                               |
| **Permission**     | Role nào được phép                     |

#### Request

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query/Params/Body:** (tùy method)

CreateUserDto:

- name: string, bắt buộc, độ dài 2-100 ký tự
- email: string, bắt buộc, format email hợp lệ, duy nhất trong hệ thống
- password: string, bắt buộc, độ dài 8-100 ký tự, phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số
- phone: string, tùy chọn, format số điện thoại quốc tế

UpdateUserDto:

- Tất cả fields đều tùy chọn (partial update)
- name: string, độ dài 2-100 ký tự
- phone: string, format số điện thoại quốc tế

QueryUserDto:

- page: number, tùy chọn, mặc định 1, giá trị 1-1000
- limit: number, tùy chọn, mặc định 20, giá trị 1-100
- search: string, tùy chọn, tìm kiếm theo name hoặc email
- sortBy: enum, tùy chọn, mặc định createdAt, các giá trị: createdAt, name, email
- sortOrder: enum, tùy chọn, mặc định DESC, các giá trị: ASC, DESC

#### Response

**Success (200/201):**

UserResponseDto - Trả về thông tin 1 user:

- id: string - UUID của user
- name: string - Tên hiển thị
- email: string - Email (đã được verify format)
- phone: string | null - Số điện thoại (có thể null)
- role: string - Vai trò của user (ADMIN hoặc USER)
- createdAt: ISO8601 datetime - Thời điểm tạo
- updatedAt: ISO8601 datetime - Thời điểm cập nhật gần nhất

PaginatedResponse - Trả về danh sách có phân trang:

- items: UserResponseDto[] - Mảng user
- total: number - Tổng số bản ghi thỏa điều kiện
- page: number - Trang hiện tại
- limit: number - Số bản ghi mỗi trang
- totalPages: number - Tổng số trang

Response wrapper chuẩn:

- success: boolean - true nếu thành công
- data: T - Data trả về (UserResponseDto hoặc PaginatedResponse)
- message: string - Thông báo thành công (tùy chọn)

**Error (400/401/403/404/500):**

USER_001 - User Not Found:

- HTTP Status: 404
- Trigger: Khi tìm user theo id mà không tồn tại
- Response: { code: 'USER_001', message: 'User not found', details: { id } }

USER_002 - Email Already Exists:

- HTTP Status: 409 Conflict
- Trigger: Khi tạo user với email đã tồn tại trong hệ thống
- Response: { code: 'USER_002', message: 'Email already exists', details: { email } }

USER_003 - Invalid Input Data:

- HTTP Status: 400
- Trigger: Khi request body chứa dữ liệu không hợp lệ (sai format, thiếu required fields, vi phạm constraints)
- Response: { code: 'USER_003', message: 'Validation failed', details: { errors: [{ field, message }] } }

AUTH_001 - Unauthorized:

- HTTP Status: 401
- Trigger: Khi không có token hoặc token không hợp lệ/hết hạn
- Response: { code: 'AUTH_001', message: 'Unauthorized' }

FORBIDDEN - Forbidden:

- HTTP Status: 403
- Trigger: Khi user có token hợp lệ nhưng không có quyền truy cập resource
- Response: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource' }

SYS_001 - Internal Server Error:

- HTTP Status: 500
- Trigger: Khi có lỗi không xác định (database error, unexpected exception)
- Response: { code: 'SYS_001', message: 'Internal server error', requestId: 'uuid' }

#### Controller

UserController xử lý các endpoint liên quan đến user management.

**Endpoints:**

| Method | Endpoint          | Mô tả                                       | Auth | Permission                   |
| ------ | ----------------- | ------------------------------------------- | ---- | ---------------------------- |
| POST   | /api/v1/users     | Tạo user mới                                | Có   | ADMIN                        |
| GET    | /api/v1/users     | Lấy danh sách users (có phân trang, filter) | Có   | ADMIN, USER                  |
| GET    | /api/v1/users/:id | Lấy thông tin 1 user                        | Có   | ADMIN, USER                  |
| PUT    | /api/v1/users/:id | Cập nhật thông tin user                     | Có   | ADMIN, USER (chỉ chính mình) |
| DELETE | /api/v1/users/:id | Xóa user                                    | Có   | ADMIN                        |

**Validation flow:**

1. ValidationPipe tự động validate request dựa trên DTO
2. Nếu fail → trả 400 với danh sách lỗi chi tiết
3. Nếu pass → chuyển vào Controller

**Response format:**

- Tất cả response được wrap bởi TransformInterceptor
- Format: { success: true, data: {...}, message: '...' }

#### Service Interface & Implementation

**IUserService interface - Định nghĩa các method public:**

```
create(CreateUserDto): Promise<UserResponseDto>
  → Tạo user mới
  → Validate: email chưa tồn tại
  → Hash password trước khi lưu
  → Throw: UserAlreadyExistsException, ValidationException

findAll(QueryUserDto): Promise<PaginatedResponse<UserResponseDto>>
  → Lấy danh sách user có phân trang
  → Support: search, sortBy, sortOrder, page, limit
  → Return: items + pagination metadata

findById(id: string): Promise<UserResponseDto>
  → Lấy user theo id
  → Throw: UserNotFoundException

update(id: string, UpdateUserDto): Promise<UserResponseDto>
  → Cập nhật user theo id
  → Validate: user tồn tại
  → Update các fields được cung cấp
  → Throw: UserNotFoundException

delete(id: string): Promise<void>
  → Xóa user theo id (soft delete)
  → Validate: user tồn tại
  → Throw: UserNotFoundException
```

**Service implementation - Luồng xử lý:**

1. **create(dto)**:
   - Check email đã tồn tại chưa (gọi repository.findByEmail)
   - Nếu tồn tại → throw UserAlreadyExistsException
   - Hash password bằng bcrypt
   - Gọi repository.create với data đã hash
   - Map result sang UserResponseDto và return

2. **findById(id)**:
   - Gọi repository.findById(id)
   - Nếu null → throw UserNotFoundException
   - Map result sang UserResponseDto và return

3. **findAll(query)**:
   - Validate pagination params
   - Gọi repository.findAll với query params
   - Map items sang UserResponseDto[]
   - Calculate totalPages
   - Return paginated response

4. **update(id, dto)**:
   - Gọi repository.findById(id)
   - Nếu null → throw UserNotFoundException
   - Merge existing data với dto
   - Gọi repository.update
   - Map result sang UserResponseDto và return

5. **delete(id)**:
   - Gọi repository.findById(id)
   - Nếu null → throw UserNotFoundException
   - Gọi repository.softDelete(id) (update deletedAt)

**Dependencies:**

- Logger (để log operations)

**Repository Sử dụng Prisma:**

- Kế thừa BaseRepository để reuse common CRUD methods
- Inject PrismaService để truy xuất database
- Tất cả queries đều có error handling (try-catch)
- Log queries trong development mode
- Không chứa business logic, chỉ thực hiện database operations

**BaseRepository - Các method chung:**

```
findOne(where: Prisma.UserWhereUniqueInput): Promise<T | null>
  → Tìm 1 bản ghi theo unique field

findMany(where: Prisma.UserWhereInput, options?): Promise<T[]>
  → Tìm nhiều bản ghi theo điều kiện

create(data: any): Promise<T>
  → Tạo bản ghi mới

update(id: string, data: any): Promise<T>
  → Cập nhật bản ghi

delete(id: string): Promise<T>
  → Xóa bản ghi (hard delete)

exists(where: any): Promise<boolean>
  → Kiểm tra bản ghi tồn tại
```

---

## 5. Xử lý ngoại lệ

### Hệ thống phân cấp Exception

```
src/common/exceptions/
├── index.ts                    # Export all exceptions
├── base.exception.ts          # Base exception class
├── user.exception.ts          # User-specific exceptions
├── auth.exception.ts          # Auth-specific exceptions
├── validation.exception.ts    # Validation exceptions
└── http.exception.ts          # HTTP exceptions wrapper
```

### DTO Validation - Mô tả nghiệp vụ

**CreateUserDto - Validation rules:**

| Field    | Rules                                                        | Error Message                                           |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| name     | Bắt buộc, string, 2-100 ký tự                                | 'Name must be between 2 and 100 characters'             |
| email    | Bắt buộc, format email hợp lệ, unique trong DB               | 'Invalid email format' / 'Email already exists'         |
| password | Bắt buộc, 8-100 ký tự, chứa 1+ chữ hoa, 1+ chữ thường, 1+ số | 'Password must contain uppercase, lowercase and number' |
| phone    | Tùy chọn, string, format international                       | 'Invalid phone number format'                           |

**UpdateUserDto - Validation rules:**

| Field | Rules                                  | Error Message                               |
| ----- | -------------------------------------- | ------------------------------------------- |
| name  | Tùy chọn, string, 2-100 ký tự          | 'Name must be between 2 and 100 characters' |
| phone | Tùy chọn, string, format international | 'Invalid phone number format'               |

**QueryUserDto - Validation rules:**

| Field     | Rules                                | Default   | Error Message                     |
| --------- | ------------------------------------ | --------- | --------------------------------- |
| page      | Tùy chọn, integer, >= 1              | 1         | 'Page must be at least 1'         |
| limit     | Tùy chọn, integer, 1-100             | 20        | 'Limit must be between 1 and 100' |
| search    | Tùy chọn, string, max 200 chars      | -         | -                                 |
| sortBy    | Tùy chọn, enum: createdAt/name/email | createdAt | 'Invalid sort field'              |
| sortOrder | Tùy chọn, enum: ASC/DESC             | DESC      | 'Invalid sort order'              |

**Validation flow:**

1. Request đến Controller
2. ValidationPipe bắt request
3. Kiểm tra từng field theo rules trong DTO
4. Nếu có lỗi → trả về 400 với danh sách field lỗi và message
5. Nếu pass → chuyển request vào Controller

**Custom Validation - Email Unique:**

- ValidationPipe gọi database để check email tồn tại
- Thực hiện query: `SELECT COUNT(*) FROM users WHERE email = ? AND deleted_at IS NULL`
- Nếu count > 0 → reject với error

**Custom Validation - Password Strength:**

- Regex pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$`
- Must contain: lowercase, uppercase, number
- Optional: special characters (khuyến khích nhưng không bắt buộc)

---

## 6. Quy ước mã lỗi

### Định dạng mã lỗi

```
{PREFIX}_{CODE}
- AUTH_001: Invalid credentials
- AUTH_002: Token expired
- AUTH_003: Token invalid
- USER_001: User not found
- USER_002: Email already exists
- USER_003: Invalid input data
- VAL_001: Validation failed
- SYS_001: Internal server error
```

### Error Constants

| Category       | Code     | Message                                  |
| -------------- | -------- | ---------------------------------------- |
| **Auth**       | AUTH_001 | Invalid credentials                      |
| **Auth**       | AUTH_002 | Token expired                            |
| **Auth**       | AUTH_003 | Token invalid                            |
| **Auth**       | AUTH_004 | Unauthorized - No token provided         |
| **Auth**       | AUTH_005 | Account locked - Too many login attempts |
| **User**       | USER_001 | User not found                           |
| **User**       | USER_002 | Email already exists                     |
| **User**       | USER_003 | Invalid input data                       |
| **User**       | USER_004 | Cannot delete your own account           |
| **Validation** | VAL_001  | Validation failed                        |
| **Validation** | VAL_002  | Invalid format                           |
| **Validation** | VAL_003  | Missing required field                   |
| **System**     | SYS_001  | Internal server error                    |
| **System**     | SYS_002  | Database error                           |
| **System**     | SYS_003  | Service unavailable                      |

**Error response format chuẩn:**

```
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": { ... },
  "requestId": "uuid"
}
```

**Error logging:**

- Tất cả errors được log với: timestamp, requestId, stack trace, userId (nếu có)
- Log levels: ERROR cho 500, WARN cho 400, INFO cho thành công
