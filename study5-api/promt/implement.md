# Generate Code From task.md + detail-design.md

Input:

- task.md
- detail-design.md

Output:

- Source code implementation

---

# Objective

Đọc:

- `task.md`
- `detail-design.md`

Sau đó implement source code theo từng task.

---

# Rules

- Chỉ implement theo task hiện tại
- Hoàn thành từng task một
- Không skip task
- Không implement ngoài scope
- Code phải production-ready
- Mapping đúng với detail-design
- Follow clean architecture
- Follow existing folder structure
- Follow coding conventions

---

# Workflow

## Step 1: Read task.md

- Xác định:
  - current phase
  - current module
  - current task

---

## Step 2: Read detail-design.md

- Đọc:
  - API design
  - database schema
  - DTO fields
  - business logic
  - validation rules
  - permissions
  - transaction flow

---

## Step 3: Implement Current Task

Ví dụ:

Task:

- [ ] Tạo `login.dto.ts`

THÌ:

- chỉ generate file `login.dto.ts`
- đúng fields theo detail-design
- đúng validation decorators
- đúng swagger decorators

---

# Implementation Rules

## Nếu task là DTO

Generate:

- DTO class
- validation decorators
- swagger decorators
- example values

---

## Nếu task là Repository

Generate:

- repository class
- methods theo task
- prisma/typeorm queries
- pagination/filter/sort nếu có

---

## Nếu task là Service

Generate:

- service methods
- business logic
- validation
- transaction
- exception handling

---

## Nếu task là Controller

Generate:

- endpoints
- guards
- DTO binding
- swagger docs
- response mapping

---

## Nếu task là Prisma

Generate:

- schema update
- relations
- enums
- indexes
- migration name

---

# Output Rules

- Output ONLY source code
- Không giải thích
- Không summary
- Không pseudo code
- Không markdown explanation

---

# Task Execution Mode

Sau khi hoàn thành 1 task:

- đánh dấu completed:
  - [x] task

- chuyển sang task tiếp theo

---

# Important

- Không generate nhiều task cùng lúc nếu chưa requested
- Hoàn thành tuần tự
- Code phải compile được
- Không tạo fake logic
- Không invent fields ngoài detail-design
- Reuse common modules nếu tồn tại

---

# INPUT

## task.md

Paste task.md here

---

## detail-design.md

Paste detail-design.md here
