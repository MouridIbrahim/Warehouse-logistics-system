# PROJECT_AUDIT.md

## LogiTrack — Full Project Audit & Product Enhancement Analysis

**Document type:** Executive audit report
**Prepared by:** Senior Software Architect / Product Manager / Security Engineer / UX Consultant
**Date:** November 23, 2026
**Project:** Logistics Transit Warehouse Operation and Maintenance System (LogiTrack)
**Scope:** Complete frontend, backend, database, security, and deployment review

---

## 1. Executive Summary

LogiTrack is a well-structured, production-capable **minimum viable warehouse management system (WMS)** built on a clean modular monolith architecture. The core warehouse workflows—inbound receiving, outbound dispatch, inventory tracking, shipment lifecycle, user/role administration, and audit logging—are implemented end-to-end with proper database transactions, optimistic concurrency control, role-based authorization, and pagination.

However, the system is **not yet production-ready** for real-world warehouse operations. Critical gaps exist in security (JWT in localStorage, no refresh tokens, in-memory rate limiting), operational resilience (no notifications, no alerts, no export, no backup strategy), and warehouse productivity (no barcode scanning, no low-stock alerts, no cycle counting, no reservations). The codebase quality is good, but the product lacks the safety nets, automation, and observability expected of a production WMS.

**Overall assessment:** Functional MVP, not production-ready without Phase 1 remediation.

---

## 2. Existing Architecture Assessment

### 2.1 Technology Stack

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Frontend | React + TypeScript + Vite | React 19, TypeScript, Vite | Implemented |
| Backend | Java + Spring Boot | Java 25, Spring Boot 4.0.10 | Implemented |
| Database | PostgreSQL | PostgreSQL 17 | Implemented |
| Migrations | Flyway | Versioned SQL migrations V1–V6 | Implemented |
| Auth | Spring Security + JWT | HS256, stateless, no refresh | Implemented |
| Containerization | Docker Compose | Backend + DB | Implemented |
| Build | Maven / npm / vite | Backend + Frontend | Implemented |
| API Docs | OpenAPI / Swagger | Declared, not verified | Partially |

### 2.2 Package Structure

**Backend** (`com.logistics.warehouse_system`):
- `controller/` — 11 REST controllers (Auth, User, Product, Warehouse, StorageLocation, Inbound, Outbound, Inventory, Shipment, Audit, Report)
- `service/` — 11 service classes with `@Transactional` boundaries
- `repository/` — 11 Spring Data JPA repositories
- `entities/` — 18 JPA entities (User, Role, Permission, Product, Warehouse, StorageLocation, InboundOrder, InboundOrderItem, OutboundOrder, OutboundOrderItem, InventoryBalance, InventoryMovement, Shipment, ShipmentStatusHistory, AuditLog, MovementType, MovementReferenceType, ShipmentStatus, InboundStatus, OutboundStatus)
- `dto/` — 30+ request/response DTOs
- `security/` — JwtService, JwtAuthenticationFilter, RateLimitFilter, SecurityConfig, CustomUserDetailsService, AppUserDetails, SecurityUtils
- `config/` — SecurityConfig, OpenApiConfig, DataInitializer
- `exception/` — GlobalExceptionHandler, NotFoundException, ConflictException, BadRequestException

**Frontend** (`src/`):
- `features/` — 18 feature modules (landing, auth, dashboard, products, warehouses, inventory, inbound, outbound, shipments, reports, audit, users, roles, settings, profile)
- `components/ui/` — Shared UI primitives (Button, Modal, Select, Pagination, EmptyState, StatusBadge, PageHeader, SearchInput, FilterToolbar, ActiveFilterChips)
- `components/layout/` — AppLayout, AppSidebar, AppTopbar, AccessDeniedPage, PageLoader
- `lib/` — axios instance, format utilities, error handling
- `types/` — Frontend TypeScript interfaces
- `hooks/` — Custom React hooks (useFilters)
- `app/router.tsx` — React Router 7 browser router with lazy loading

### 2.3 API Endpoint Inventory (40 total)

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/v1/auth/register` | POST | Public | Implemented |
| `/api/v1/auth/login` | POST | Public | Implemented |
| `/api/v1/auth/change-password` | POST | Authenticated | Implemented |
| `/api/v1/auth/me` | GET | Authenticated | Implemented |
| `/api/v1/users` | GET/POST | ADMINISTRATOR | Implemented |
| `/api/v1/users/{id}` | GET/PATCH | ADMINISTRATOR | Implemented |
| `/api/v1/users/{id}/password` | PATCH | ADMINISTRATOR | Implemented |
| `/api/v1/roles` | GET | ADMINISTRATOR | Implemented |
| `/api/v1/products` | GET | All roles | Implemented |
| `/api/v1/products/{id}` | GET/PATCH | ADMIN/WM | Implemented |
| `/api/v1/warehouses` | GET | All roles | Implemented |
| `/api/v1/warehouses/{id}` | GET/PATCH | ADMIN/WM | Implemented |
| `/api/v1/warehouses/{id}/locations` | GET/POST | All/ADMIN-WM | Implemented |
| `/api/v1/warehouses/{id}/locations/{lid}` | GET/PATCH | All/ADMIN-WM | Implemented |
| `/api/v1/inbound-orders` | GET | All roles | Implemented |
| `/api/v1/inbound-orders/{id}` | GET | All roles | Implemented |
| `/api/v1/inbound-orders` | POST | ADMIN/WM/WE | Implemented |
| `/api/v1/inbound-orders/{id}/confirm` | POST | ADMIN/WM/WE | Implemented |
| `/api/v1/outbound-orders` | GET | All roles | Implemented |
| `/api/v1/outbound-orders/{id}` | GET | All roles | Implemented |
| `/api/v1/outbound-orders` | POST | ADMIN/WM/WE | Implemented |
| `/api/v1/outbound-orders/{id}/dispatch` | POST | ADMIN/WM/WE | Implemented |
| `/api/v1/inventory` | GET | All roles | Implemented |
| `/api/v1/inventory/movements` | GET | All roles | Implemented |
| `/api/v1/inventory/adjustments` | POST | ADMIN/WM | Implemented |
| `/api/v1/shipments` | GET | ADMIN/WM/SM/VA | Implemented |
| `/api/v1/shipments/{id}` | GET | ADMIN/WM/SM/VA | Implemented |
| `/api/v1/shipments/{id}/history` | GET | ADMIN/WM/SM/VA | Implemented |
| `/api/v1/shipments` | POST | ADMIN/WM/SM | Implemented |
| `/api/v1/shipments/{id}/status` | PATCH | ADMIN/WM/SM | Implemented |
| `/api/v1/reports/dashboard` | GET | All roles | Implemented |
| `/api/v1/audit-logs` | GET | ADMIN/WM/VA | Implemented |

---

## 3. Current Implementation Overview

### 3.1 Fully Implemented Features

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| User registration (first admin bootstrap) | Yes | Yes | Register endpoint returns 409 if admin exists |
| User login (JWT issuance) | Yes | Yes | Token stored in localStorage |
| Password change (self-service) | Yes | Yes | `/auth/change-password` |
| Password reset (admin) | Yes | Yes | `PATCH /users/{id}/password` |
| User CRUD | Yes | Yes | Admin only |
| Role-based access control (5 roles) | Yes | Yes | `@PreAuthorize` + frontend guards |
| Product CRUD + search | Yes | Yes | Search by SKU/name, unit, active, date |
| Warehouse CRUD | Yes | Yes | Search by code/name, active, date |
| Storage location CRUD | Yes | Yes | Nested under warehouse |
| Inbound order CRUD + confirm | Yes | Yes | Transactional inventory update on confirm |
| Outbound order CRUD + dispatch | Yes | Yes | Stock validation, negative stock prevention |
| Inventory balances + movements | Yes | Yes | Stock overview + movement history |
| Inventory adjustment | Yes | Yes | Admin/WM only, non-negative enforcement |
| Shipment CRUD + status transitions | Yes | Yes | State machine enforced, history tracked |
| Dashboard reports | Yes | Yes | Volume, pending counts, status breakdown |
| Audit logs | Yes | Yes | Filter by entity/action/actor/date |
| Rate limiting (login/register) | Yes | N/A | In-memory, 10 req/60s |
| Pagination on all list endpoints | Yes | Yes | PageResponse DTO |
| Optimistic locking (InventoryBalance @Version) | Yes | N/A | Hibernate version column |
| Database CHECK constraints | Yes | N/A | Non-negative quantity, positive item quantities |

### 3.2 Partially Implemented Features

| Feature | Gap |
|---------|-----|
| Reporting | Only dashboard endpoint exists; no export, no scheduled reports, no custom report builder |
| Audit logs | Read-only list; no search across metadata, no export, no alerting on suspicious activity |
| Notifications | Bell icon exists in topbar but no backend notification service, no WebSocket/SSE, no in-app notification center |
| Settings page | Placeholder — no actual configurable settings |
| Roles & Permissions page | Read-only matrix; no actual permission assignment UI |

### 3.3 Present in UI but Not Fully Functional

| Feature | Issue |
|---------|-------|
| Notifications bell (topbar) | Static badge with no backend service or data |
| Settings page | "No configurable settings" message; nothing to configure |
| Roles page | Read-only reference; cannot assign or modify permissions |

### 3.4 Missing Entirely

- Barcode/QR scanning (explicitly out of scope per PROJECT_DETAILS.md §8)
- Supplier/customer management (explicitly out of scope)
- Partial receiving/dispatch (explicitly out of scope)
- Damaged/quarantined stock handling
- Stock transfers between locations/warehouses
- Stock reservation/hold
- Low-stock alerts/reorder recommendations
- Inventory aging/expiry analysis
- Cycle counting workflow
- Picking/packing workflow
- Delivery confirmation/proof of delivery
- Carrier integration
- CSV/Excel/PDF export
- Scheduled/automated reports
- WebSocket/SSE real-time updates
- Refresh token / token revocation
- Account lockout after failed login attempts
- Password reset flow (email-based)
- Session management / concurrent session control
- API versioning
- Health checks beyond `/actuator/health`
- Structured logging / metrics / monitoring
- CI/CD pipeline
- Automated database backup

---

## 4. Production Readiness Assessment

### 4.1 Architecture and Code Quality — PARTIALLY COMPLETE

**Strengths:**
- Clean layered architecture (controller → service → repository → entity)
- Consistent DTO pattern (no entity exposure to API)
- `@Transactional` boundaries on all write operations
- Optimistic concurrency control on InventoryBalance (`@Version`)
- Proper exception hierarchy with `GlobalExceptionHandler`
- Pagination on all list endpoints
- Server-side filtering on most endpoints
- Lazy loading with `EntityGraph` to avoid N+1

**Weaknesses:**
- **No database indexes** beyond primary keys and unique constraints — queries on `created_at`, `status`, `warehouse_id`, `occurred_at` will table-scan as data grows
- **In-memory rate limiting** — lost on restart, not distributed across backend instances
- **No input sanitization** beyond Bean Validation — potential for XSS in free-text fields (notes, descriptions) rendered in frontend
- **No API versioning** — breaking changes will require client coordination
- **Error responses** return stack-adjacent info (timestamp, code) but no correlation ID for distributed tracing

### 4.2 Security — MISSING / INADEQUATE

**Critical findings:**

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | JWT stored in `localStorage` | Critical | Vulnerable to XSS theft. No HttpOnly cookie option. |
| 2 | No refresh token mechanism | High | Single access token with fixed expiry; no rotation or revocation |
| 3 | No token blacklist/revocation | High | Compromised tokens remain valid until expiry |
| 4 | Rate limiter is in-memory | High | Lost on restart; not distributed; single point of failure |
| 5 | No account lockout | Medium | Unlimited failed login attempts possible |
| 6 | CORS `AllowCredentials: true` with `AllowedHeaders: *` | Medium | Overly permissive; should restrict to known origins only |
| 7 | No security headers (CSP, HSTS, X-Content-Type-Options) | Medium | Browser-level protections missing |
| 8 | No password complexity policy | Medium | Backend accepts any password; frontend only enforces min length 8 |
| 9 | Audit log `metadata` is free-text VARCHAR(4000) | Low | No schema enforcement; potential for sensitive data leakage |
| 10 | `SecurityUtils.currentUserId()` throws if unauthenticated | Low | Could expose 500 instead of 401 on some edge cases |

**Authentication flow:**
- Login → JWT issued with `uid`, `roles` claims → stored in `localStorage` → sent as `Bearer` header
- No token refresh → users must re-login after expiry
- Logout → clears localStorage only (no server-side invalidation)

### 4.3 Database and Data Integrity — PARTIALLY COMPLETE

**Strengths:**
- `quantity_on_hand CHECK (quantity_on_hand >= 0)` — prevents negative stock at DB level
- `received_quantity CHECK (received_quantity > 0)` — prevents zero/negative item quantities
- `requested_quantity CHECK (requested_quantity > 0)` — same for outbound
- `UNIQUE (product_id, storage_location_id)` on inventory_balances
- `UNIQUE (sku)`, `UNIQUE (reference_number)`, `UNIQUE (tracking_number)`
- `@Version` column on InventoryBalance for optimistic locking
- `TIMESTAMPTZ` for all timestamps (timezone-aware)
- Restrictive FK behavior (default RESTRICT)

**Weaknesses:**
- **No indexes** on foreign key columns (`warehouse_id`, `product_id`, `storage_location_id`, `performed_by`, `created_by`)
- **No index** on `inventory_movements.occurred_at` — date-range reports will table-scan
- **No index** on `inventory_movements.reference_type + reference_id` — movement lookups by order will be slow
- **No soft delete** — historical records are hard-deleted if code ever calls `delete()`
- **No archive/purge strategy** for audit_logs (could grow unbounded)
- **No check constraint** linking `outbound_order.status` to valid enum values (relying on application code only)
- **No check constraint** linking `inbound_order.status` to valid enum values

### 4.4 Inventory and Warehouse Operations — PARTIALLY COMPLETE

**Strengths:**
- Confirming inbound updates balance + creates movement atomically in one transaction
- Dispatching outbound validates stock, decreases balance, creates movement atomically
- Negative stock prevention at both application and database level
- `@Version` optimistic locking prevents lost updates
- Movement types: INBOUND, OUTBOUND, ADJUSTMENT
- Flat location hierarchy (warehouse → storage_location)

**Weaknesses / Missing:**
- **No stock reservation** — stock can be double-allocated between order creation and dispatch
- **No partial dispatch** — confirmed by project decision, but limits flexibility
- **No damaged/quarantined stock** — corrections use adjustment movement only
- **No stock transfers** between locations (confirmed out of scope)
- **No low-stock monitoring** — no alerting when stock falls below threshold
- **No cycle counting** — no workflow for physical inventory verification
- **No picking/packing** — no wave picking, zone picking, or packing slip generation
- **No receiving putaway suggestions** — no guided location assignment

---

## 5. Performance and Scalability — PARTIALLY COMPLETE

**Current state:**
- Pagination (default 20/page) on all list endpoints
- `EntityGraph` on InboundOrder/OutboundOrder to avoid N+1 on items
- `findAllByOrderByCreatedAtDesc` with `@EntityGraph` for eager loading

**Bottlenecks as data grows:**
| Query | Current Approach | Risk at Scale |
|-------|-----------------|---------------|
| Inventory movements by date range | Table scan (no index on `occurred_at`) | High |
| Inbound/outbound by status + warehouse | Table scan (no composite index) | Medium |
| Audit logs by actor + date | Table scan | Medium |
| Product search by SKU/name | ILIKE with `%term%` — cannot use B-tree index efficiently | Medium |
| Dashboard aggregations | Multiple count/sum queries | Low (small dataset) |

**No background job processing** — all operations are synchronous HTTP requests. Large inbound orders (100+ items) could cause request timeouts.

---

## 6. Frontend and User Experience — COMPLETE / GOOD

**Strengths:**
- Consistent Industrial Orange design system (`#C45D16` primary, `#242B35` sidebar)
- Inter font family, Material Symbols icons
- FilterToolbar + ActiveFilterChips reusable component library
- Route-level code-splitting with React.lazy
- Role-aware navigation guards
- Loading, empty, and error states on all pages
- Debounced search (400ms)
- Responsive grid layouts

**Weaknesses:**
- No optimistic UI updates (all mutations block until server responds)
- No bulk operations (select multiple, batch confirm/dispatch)
- No CSV import/export
- No print-friendly views (pick lists, packing slips, labels)
- Mobile responsiveness is basic (sidebar hides on mobile but no dedicated mobile layout)
- No keyboard shortcuts
- No undo/redo for inventory adjustments
- No toast notification system (error handling is inline only)
- No form draft persistence (form data lost on navigation)

---

## 7. Deployment and Operations — PARTIALLY COMPLETE

**Implemented:**
- Docker Compose (db + backend)
- Named volume for PostgreSQL data
- Health check on PostgreSQL (`pg_isready`)
- Backend depends on DB healthy
- `.env.example` with placeholders
- `ddl-auto: validate` (no Hibernate schema auto-update)

**Missing:**
- **No health check endpoint** on backend beyond `/actuator/health` (not verified if exposed)
- **No structured logging** (no JSON logging, no correlation IDs)
- **No metrics** (no Prometheus endpoint, no Grafana)
- **No centralized log aggregation** (no ELK/EFK stack)
- **No automated backup** strategy documented for PostgreSQL
- **No CI/CD pipeline** (no GitHub Actions, no automated testing on push)
- **No blue/green or rolling deployment** strategy
- **No secret management** — `.env` file with DB password
- **No reverse proxy** (no nginx/traefik for SSL termination, rate limiting, WAF)
- **No container security scanning** (no Trivy, no Snyk)

---

## 8. Main Weaknesses and Risks

### Critical (Must fix before production):

1. **JWT in localStorage** — XSS vulnerability exposes all user sessions
2. **No refresh token / token revocation** — compromised tokens valid until expiry
3. **In-memory rate limiter** — not distributed, lost on restart, bypassable behind load balancer
4. **No database indexes beyond PK/unique** — performance will degrade rapidly with production data volumes
5. **No account lockout** — credential stuffing possible
6. **No backup strategy** — single point of data loss

### High:

7. **No stock reservation** — double-allocation risk between order creation and dispatch
8. **No low-stock alerts** — stockouts only discovered at dispatch time
9. **No notifications** — users must poll to see updates
10. **No export functionality** — data locked in system, cannot integrate with Excel/ERP
11. **No password complexity / lockout** — weak authentication policy
12. **No security headers** — clickjacking, MIME sniffing, XSS via CSP missing

### Medium:

13. **No API versioning** — breaking changes require client coordination
14. **No structured logging** — debugging production issues difficult
15. **No monitoring/alerting** — silent failures possible
16. **No CI/CD** — manual deployment, no automated testing on push
17. **No soft delete** — accidental data loss possible

---

## 9. Critical Findings

1. **The system passes all 16 required workflow test scenarios** from SECURITY_AND_TESTING.md §9 based on code inspection, but has not been tested under concurrent load.

2. **Inventory integrity is the strongest area** — transactions, optimistic locking, and DB CHECK constraints are properly implemented.

3. **Security is the weakest area** — JWT storage, no refresh tokens, no lockout, in-memory rate limiting, missing security headers.

4. **Operational observability is absent** — no metrics, no structured logging, no alerting, no health checks beyond basic actuator.

5. **The permission matrix in SECURITY_AND_TESTING.md §3.2 is partially implemented** — `VIEWER_AUDITOR` "Read as needed" and `WAREHOUSE_EMPLOYEE` "Limited operational assignment only" are not precisely defined in code; frontend role checks are coarse (role arrays, not fine-grained permissions).

6. **Warehouse-level data isolation is not enforced** — despite schema having `warehouse_id` on orders, the backend does not filter by user's assigned warehouse. Any authenticated user can see all warehouses' data.

---

## 10. Assumptions and Unresolved Business Questions

1. **Multi-warehouse access control** — Schema supports `warehouse_id` but no warehouse assignment to users exists. Decision needed: should users see only their assigned warehouse's data?

2. **JWT expiry duration** — Not verified in `application.yml`; need to confirm access token TTL and whether it meets security policy.

3. **Rate limiter behind reverse proxy** — `X-Forwarded-For` is honored, but if multiple backend instances run, each has its own in-memory store. Need centralized rate limiting (Redis) or API gateway.

4. **Password reset flow** — No email-based password reset exists. Only admin reset and self-service change-password (requires knowing current password).

5. **Data retention** — No policy for audit_logs or inventory_movements purging.

6. **Notification channel** — In-app vs email vs SMS for alerts not decided.

---
