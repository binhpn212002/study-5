# Generate task.md From detail-design.md

Input:

- detail-design.md

Output:

- task.md

---

# Rules

- Đọc toàn bộ `detail-design.md`
- Generate ra file `task.md`
- Task phải mapping đúng với detail design
- Không generate generic task
- Không invent business logic
- Task phải implementation-ready

---

# Output Format

# Technical Design Implementation Tasks

---

# Phase 1: Analyze Detail Design & Generate Structure

## Step 1: Read Detail Design

- Đọc:
  - modules
  - APIs
  - entities
  - database schema
  - business flow
  - permissions
  - integrations
  - queue/events
  - cache strategy

---

## Step 2: Generate Folder Structure

Generate task tạo folder structure theo module thực tế.

Ví dụ:

- [ ] Tạo folder `src/modules/auth`
- [ ] Tạo folder `src/modules/users`
- [ ] Tạo folder `src/common`
- [ ] Tạo folder `src/database`
- [ ] Tạo folder `src/config`

Generate theo đúng module trong detail-design.

---

# Phase 2: Database & Prisma

## Step 1: Update schema.prisma

Generate task update:

- models
- relations
- enums
- indexes
- soft delete
- timestamps

Ví dụ:

- [ ] Tạo model `User`
- [ ] Tạo model `RefreshToken`
- [ ] Tạo enum `UserRole`

---

## Step 2: Generate Migration

Ví dụ:

- [ ] Generate migration `init_auth_module`
- [ ] Run prisma migrate
- [ ] Generate prisma client

---

# Phase 3: Common Infrastructure

## Step 1: Constants

Generate task:

- [ ] Tạo `role.constant.ts`
- [ ] Tạo `error-code.constant.ts`
- [ ] Tạo `cache-key.constant.ts`

---

## Step 2: Exceptions

Generate task:

- [ ] Tạo `BaseException`
- [ ] Tạo `BusinessException`
- [ ] Tạo `UnauthorizedException`
- [ ] Tạo `UserNotFoundException`

---

## Step 3: Repository Layer

Generate task:

- [ ] Tạo `BaseRepository`
- [ ] Tạo `UserRepository`
- [ ] Tạo `AuthRepository`

Generate methods theo detail design.

---

# Phase 4: Controllers Implementation

Generate controller task theo APIs thực tế.

Ví dụ:

## Auth Controller

- [ ] Implement `POST /api/v1/auth/login`
- [ ] Implement `POST /api/v1/auth/register`
- [ ] Implement `POST /api/v1/auth/refresh`

## User Controller

- [ ] Implement `GET /api/v1/users`
- [ ] Implement `GET /api/v1/users/:id`
- [ ] Implement `POST /api/v1/users`

Generate theo APIs trong detail-design.

---

# Phase 5: Services Implementation

Generate service task theo business flow thực tế.

Ví dụ:

## Auth Service

- [ ] Implement login logic
- [ ] Implement register logic
- [ ] Implement refresh token logic
- [ ] Implement forgot password flow
- [ ] Implement OTP verification

## User Service

- [ ] Implement create user
- [ ] Implement update user
- [ ] Implement soft delete user
- [ ] Implement pagination + filtering

Generate đúng theo detail-design.

---

# Important

- Chỉ generate task tồn tại trong detail-design
- Không bỏ sót APIs
- Không bỏ sót database tables
- Không bỏ sót business flow
- Task phải actionable
- Task phải implementation-ready

---

# INPUT

Paste detail-design.md below:
