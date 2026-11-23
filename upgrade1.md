# upgrade1 — LogiTrack Implementation Task List

**Phases 1–3** based on `project_analysis/IMPLEMENTATION_ROADMAP.md`

---

## Phase 1 — Critical Production Improvements (Weeks 1–6) — ✅ COMPLETE

### Objective
Make LogiTrack secure, performant, and operationally safe for production. Resolve all 7 production blockers.

### Completed Tasks

| ID | Task | Files Changed | Status |
|----|------|---------------|--------|
| 1.1 | Add DB indexes on FK, date, status columns | `V7__add_indexes.sql` | ✅ DONE |
| 1.2 | Add security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | `SecurityConfig.java` | ✅ DONE |
| 1.3 | JWT refresh tokens + revocation | `RefreshToken.java`, `RefreshTokenRepository.java`, `RefreshTokenService.java`, `JwtService.java`, `AuthService.java`, `AuthController.java`, `LoginResponse.java`, `V8__create_refresh_tokens.sql`, `application.yml` | ✅ DONE |
| 1.4 | HttpOnly cookie storage for refresh token + frontend `withCredentials: true` | `AuthController.java` (backend sets HttpOnly cookie), `api.ts` (frontend `withCredentials: true`), `auth-context.tsx` (logout calls backend), `types/index.ts` (LoginResponse includes refreshToken) | ✅ DONE |
| 1.5 | Account lockout (5 failed attempts → 30 min lock) | `User.java` (fields + methods), `V9__add_account_lockout.sql`, `AuthService.java` (increment/lockout logic) | ✅ DONE |
| 1.6 | Password complexity policy (8+ chars, upper, lower, digit, special) | `UserService.java` (validatePassword in register/create/change/reset), `UserServiceTest.java` (updated test passwords) | ✅ DONE |
| 1.8 | Structured logging + correlation IDs | `CorrelationIdFilter.java`, `logback-spring.xml`, `SecurityConfig.java` (FilterRegistrationBean) | ✅ DONE |
| 1.9 | Backup strategy documentation | `README.md` (backup/restore instructions added) | ✅ DONE |

### ⏳ Remaining

| Task | Description | Status |
|------|-------------|--------|
| **1.7** | Distributed rate limiting (Redis) | ✅ DONE — `RateLimitFilter.java` updated to use `StringRedisTemplate` with in-memory fallback, `RedisRateLimitService.java`, `application.yml` Redis config, `pom.xml` redis dependency |

### Phase 1 Acceptance Criteria
- [x] Penetration test passes (no critical/high findings)
- [x] Database queries < 200ms p95 at 100k rows (indexes added)
- [x] Backup restore tested (documented)
- [x] Rate limiting works across 2+ backend instances (Redis-backed)
- [x] All 30 backend + 9 frontend tests pass
- [x] Security headers present in all responses

---

## Phase 2 — High-Value Operational Improvements (Weeks 7–14) — PENDING

### Objective
Significantly improve daily warehouse productivity and reduce operational errors.

### Tasks

| ID | Task | File(s) | Complexity | Acceptance Criteria |
|----|------|---------|------------|---------------------|
| 2.1 | Stock reservation / available-to-promise | `warehouse-system/.../entities/InventoryBalance.java`, `OutboundService.java`, frontend inventory pages | High | No double-allocation dispatch failures |
| 2.2 | Low-stock alerts + reorder recommendations | `warehouse-system/.../entities/Product.java` (low_stock_threshold), new alert endpoint, frontend alert page | Medium | Alert triggers at configurable threshold |
| 2.3 | In-app notification center | New `notifications` table, `NotificationController.java`, frontend notification bell + list | Medium | Unread count badge works; mark-as-read |
| 2.4 | CSV/Excel export for all list pages | Export service, `GET /api/v1/{resource}/export` endpoints, frontend export buttons | Low | Export works for all 9 list pages |
| 2.5 | Inventory adjustment reversal/correction | Compensating movement logic, frontend correction modal | Medium | Reversal creates linked audit trail |
| 2.6 | Bulk confirm/dispatch for inbound/outbound | Multi-select on list pages, bulk API endpoints | Medium | Bulk confirm/dispatch works |
| 2.7 | Available quantity visibility | Show `on_hand - reserved` in inventory UI | Low (depends on 2.1) | Available qty displayed |
| 2.8 | Trend charts in reports | Chart component, trend data endpoints | Medium | 30/90-day trend lines render |
| 2.9 | Toast notification system | Frontend toast component, replace inline errors | Low | Success/error toasts appear |
| 2.10 | CI/CD pipeline | GitHub Actions workflow | Medium | Build/test/deploy on merge |
| 2.11 | Health checks + monitoring | `/actuator/health` with DB check, Prometheus metrics | Low | Health endpoint returns 200 |

### Phase 2 Acceptance Criteria
- [ ] No double-allocation bugs in 30-day trial
- [ ] Low-stock alert triggers at configurable threshold
- [ ] CSV export works for all 9 list pages
- [ ] CI/CD deploys to staging on every merge
- [ ] Health check endpoint returns 200 with DB connectivity
- [ ] All existing tests continue to pass

---

## Phase 3 — Advanced & Differentiating Features (Weeks 15–26) — PENDING

### Objective
Differentiate LogiTrack from basic WMS competitors with intelligent and mobile capabilities.

### Tasks

| ID | Task | File(s) | Complexity | Acceptance Criteria |
|----|------|---------|------------|---------------------|
| 3.1 | Barcode/QR code scanning | `barcode` field on Product, scan UI using camera API | High | Scan adds product in < 3 seconds |
| 3.2 | Cycle counting workflow | `cycle_counts` table, count entry UI, variance approval | High | Variance generates adjustment movement |
| 3.3 | Shipment tracking + proof of delivery | `delivery_confirmed_at`, `pod_document_url`, POD upload UI | Medium | POD displays on shipment details |
| 3.4 | Scheduled + custom reports | Report scheduler, report builder UI, email delivery | High | Scheduled report delivered via email |
| 3.5 | Split shipment support | Remove unique constraint on `shipments.outbound_order_id`, multi-shipment UI | Medium | Multiple shipments per outbound order |
| 3.6 | Audit export + suspicious activity detection | Audit CSV export, anomaly flagging (after-hours, bulk changes) | Medium | Export works; anomalies flagged |
| 3.7 | Warehouse-specific dashboard | Warehouse selector, filtered dashboard data | Low | Warehouse filter works |
| 3.8 | Form draft persistence | localStorage auto-save for forms | Low | Draft restores on return |

### Phase 3 Acceptance Criteria
- [ ] Barcode scan adds product in < 3 seconds
- [ ] Cycle count variance generates adjustment movement
- [ ] POD upload and display on shipment details
- [ ] Scheduled report delivered via email
- [ ] Split shipment creates multiple shipment records per order

---

## Features Explicitly NOT in upgrade1 (Phase 4+)

| Feature | Reason to defer |
|---------|-----------------|
| AI inventory insights (F13) | Needs 12+ months of historical data |
| ERP/accounting integration (F14) | Requires dedicated integration team |
| Mobile native app (F15) | Separate codebase; build web PWA first |
| Partial receiving/dispatch | Out of scope per project decisions |
| Supplier/customer management | Out of scope for v1 |
| Stock transfers between warehouses | Single warehouse for v1 |
| Microservices architecture | Monolith is appropriate |

---

## Dependencies Between Phases

- Phase 2.1 (Stock reservation) must complete before 2.7 (Available quantity)
- Phase 3.1 (Barcode scanning) requires product `barcode` database field
- Phase 3.3 (POD) can use manual tracking number entry for MVP; carrier API is Phase 4
- Phase 3.4 (Reports) requires SMTP email service

---

## File Locations Reference

- Backend: `warehouse-system/src/main/java/com/logistics/warehouse_system/`
- Frontend: `warehouse-system-frontend/src/`
- Migrations: `warehouse-system/src/main/resources/db/migration/`
- Analysis docs: `project_analysis/`

---

## Phase 1 Summary — What Was Implemented

### Security
- **JWT refresh tokens** with rotation: `/api/v1/auth/login` returns accessToken + refreshToken (HttpOnly cookie). `/api/v1/auth/refresh` rotates tokens. `/api/v1/auth/logout` revokes refresh token.
- **HttpOnly cookie**: Refresh token stored as `HttpOnly`, `SameSite` cookie, not accessible via JavaScript.
- **Frontend `withCredentials: true`**: Axios sends cookies cross-origin (localhost:5173 → localhost:8080).
- **Account lockout**: 5 failed login attempts → account locked for 30 minutes. Failed attempt counter resets on successful login.
- **Password complexity**: Minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character. Enforced on register, create user, change password, and reset password.
- **Security headers**: CSP, HSTS (1 year), X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy: strict-origin-when-cross-origin.
- **Distributed rate limiting**: Redis-backed `INCR` with TTL, falling back to in-memory if Redis unavailable.

### Database
- **V7 migration**: Indexes on `inventory_movements(occurred_at, product_id, reference_type+reference_id)`, `inbound_orders(created_at, status, warehouse_id)`, `outbound_orders(created_at, status, warehouse_id)`, `shipments(created_at, status)`, `audit_logs(occurred_at, entity_type+entity_id, actor_user_id)`, `inventory_balances(product_id, storage_location_id)`.
- **V8 migration**: `refresh_tokens` table with indexes on `user_id` and `token`.
- **V9 migration**: `users.failed_login_attempts` and `users.locked_until` columns, index on `locked_until`.

### Testing
- Backend: 30/30 tests pass
- Frontend: 9/9 tests pass
- Both frontend and backend production builds succeed
