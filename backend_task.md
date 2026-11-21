# Backend Task Plan

Execution checklist for the backend of the Logistics Transit Warehouse
Operation and Maintenance System. This is a checklist, not a specification.
Authoritative specs: `docs/PROJECT_DETAILS.md`, `docs/BACKEND.md`,
`docs/DATABASE.md`, `docs/SECURITY_AND_TESTING.md`.

## 1. Current state

- Spring Boot **4.0.10**, Java **25**, Maven, package
  `com.logistics.warehouse_system`.
- Docker Compose, `.env.example`, `.gitignore`, `application.yml`, and the
  Flyway migrations V1–V6 are in place.
- Layered package structure implemented:
  `entities` / `repository` / `service` / `controller` / `dto` /
  `config` / `security` / `exception`.
- Foundation compiles (`mvnw compile` → BUILD SUCCESS).

## 2. Confirmed decisions

See `docs/PROJECT_DETAILS.md` §9 (single warehouse, no suppliers/customers,
no partial receive/dispatch, no approval workflow, flat location hierarchy,
shipment state machine, one shipment per outbound order, whole-number
quantities, JWT auth, numeric IDs).

## 3. Conventions

- Base package `com.logistics.warehouse_system` with layered packages:
  - `entities` — JPA entities and enums
  - `repository` — Spring Data repositories
  - `service` — business logic and transaction boundaries
  - `controller` — REST controllers
  - `dto` — request/response records and error/pagination wrappers
  - `config` — security config, seed initializer
  - `security` — JWT, filter, UserDetails
  - `exception` — exceptions and global handler
- Migrations: `src/main/resources/db/migration/`, `ddl-auto: validate`.
- IDs: BIGINT identity. Timestamps: `TIMESTAMPTZ` / `Instant` (UTC).
- Authorization: role authorities (`ROLE_ADMINISTRATOR`, ...), deny by
  default, `@PreAuthorize` on controllers/methods.
- Inventory concurrency: optimistic locking via `@Version` +
  `CHECK (quantity_on_hand >= 0)`.

## 4. Task list

Status legend: `TODO` / `IN_PROGRESS` / `BLOCKED` / `DONE`.

### Foundation (infra, schema, security, auth, users)

- **BE-001** — `docker-compose.yml` (in `warehouse-system/`) + `Dockerfile` +
  `.dockerignore` + `.env`/`.env.example` + `README.md` run instructions. `DONE`
- **BE-002** — `application.yml` (datasource env, `ddl-auto: validate`,
  Flyway, JWT/CORS, pagination defaults). `DONE`
- **BE-003** — Flyway migrations V1–V6 (identity, products/warehouses,
  orders, inventory, shipments/audit, role seed). `DONE`
  _(written; not yet executed against live PostgreSQL — Docker not running)_
- **BE-004** — Identity entities + repos (User, Role, Permission). `DONE`
- **BE-005** — Product/Warehouse entities + repos. `DONE`
- **BE-006** — Inbound/Outbound order entities + repos. `DONE`
- **BE-007** — Inventory entities + repos. `DONE`
- **BE-008** — Shipment + audit entities + repos. `DONE`
- **BE-009** — Security config + JWT service/filter + UserDetailsService. `DONE`
- **BE-010** — Auth endpoints (`/auth/login`, `/auth/me`). `DONE`
- **BE-011** — Authorization + dev seed accounts. `DONE`
- **BE-012** — Global exception handler + `ApiError`. `DONE`
- **BE-013** — Pagination + `PageResponse` + DTO conventions. `DONE`
- **BE-014** — User & role administration endpoints. `DONE`

### Feature modules (not yet implemented)

- **BE-015** — Product management (CRUD + deactivate + search). `DONE`
- **BE-016** — Warehouse & storage-location management. `DONE`
- **BE-017** — Inbound receiving (create + confirm → inventory + movement). `TODO`
- **BE-018** — Inventory monitoring + manual adjustment. `TODO`
- **BE-019** — Outbound processing (create + dispatch, concurrency-safe). `TODO`
- **BE-020** — Shipment management (create + validated status transitions). `TODO`
- **BE-021** — Reports / dashboard. `TODO`
- **BE-022** — Audit history read endpoint. `TODO`

### Quality

- **BE-023** — Unit tests (service rules, transitions, validation). `TODO`
- **BE-024** — Integration tests (Postgres/Testcontainers: workflows,
  rollback, concurrency, auth). `TODO`
- **BE-025** — OpenAPI annotations + Swagger UI verification. `TODO`

## 5. API contract (agreed shape)

- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `GET|POST /api/v1/users`, `GET|PATCH /api/v1/users/{id}`, `GET /api/v1/roles`
- Error envelope: `{ status, code, message, fieldErrors?, timestamp }`
- Pagination: `{ content, page, size, totalElements, totalPages }`

## 6. Assumptions / open items

- JWT: fixed short expiry, no refresh-token rotation in v1.
- Docker Desktop must be started to run PostgreSQL, execute Flyway against a
  real DB, and run Testcontainers-based integration tests.

## 7. Progress

| Task | Status | Notes |
|---|---|---|
| BE-001 … BE-014 | DONE | Foundation compiles; DB-backed run pending Docker |
| BE-015 | DONE | Product management compiles |
| BE-016 | DONE | Warehouse & location management compiles |
| BE-017 … BE-022 | TODO | Feature modules |
| BE-023 … BE-025 | TODO | Tests + OpenAPI |
