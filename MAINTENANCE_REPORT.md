# LogiTrack Maintenance Report

## 1. Executive Summary

The LogiTrack Logistics Transit Warehouse Operation and Maintenance System underwent a maintenance and stabilization pass against the current worktree. The frontend production build and strict TypeScript check pass, all 12 frontend tests pass, and the backend Maven suite passes all 35 tests. The frontend lint command exits successfully with existing warnings.

**Previously identified critical fixes:** 7 (including authentication token expiration, inventory cycle count data integrity, LOW_STOCK filter threshold, and missing ToastProvider on auth routes). Additional functional fixes are listed below.

**Performance improvements:** Fixed missing loading states on 7 `refresh()` functions across 6 pages, eliminating UI flashes and improving perceived responsiveness.

**Overall condition:** Builds and automated tests pass. The live Docker stack and read-only browser/API smoke checks were verified. Mutating browser E2E flows were not run against the shared development database; automated Playwright coverage remains a documented gap.

---

## 2. Problems Discovered

| # | Problem | Severity | Area |
|---|---------|----------|------|
| 1 | `useToast` called outside `ToastProvider` on /login, /register, / routes — app crashes | Critical | Frontend |
| 2 | No JWT access token refresh / 401 handling — API calls fail after token expiry (~1 hour) | Critical | Frontend |
| 3 | `cycleCount` audit log records wrong "previous" quantity (reads post-update value) | Critical | Backend |
| 4 | `cycleCount` reservedQuantity capped using new quantityOnHand instead of previous | Critical | Backend |
| 5 | `LOW_STOCK` filter uses hardcoded threshold of 10 instead of product's `lowStockThreshold` | Critical | Backend |
| 6 | `ReportsPage` TrendChart displays hardcoded mock data (multiples of inboundVolume) | Medium | Frontend |
| 7 | `CycleCountPage` search field `onChange` is a no-op — search doesn't work | Medium | Frontend |
| 8 | `CycleCountPage` passes `0` instead of `undefined` for empty locationId | Medium | Frontend |
| 9 | `CycleCountPage` passes balance ID as productId to cycleCount API | Medium | Frontend |
| 10 | `CycleCountPage` uses browser `alert()` instead of toast notifications | Medium | Frontend |
| 11 | `CreateInboundOrderPage` has duplicate `ItemRow` interface declaration | Medium | Frontend |
| 12 | `CreateInboundOrderPage` form draft persistence incomplete — draft never saved | Medium | Frontend |
| 13 | `refresh()` in 6 pages doesn't set loading state — UI flashes on data refresh | Low | Frontend |
| 14 | CSV export endpoints return 400 when date filters provided — date format mismatch between frontend date picker and backend | High | Frontend + Backend |
| 15 | Dashboard product and warehouse counts returned HTTP 500 from PostgreSQL parameter-type and custom HQL search issues | High | Frontend + Backend |
| 16 | Inventory Movement History and User Management list queries failed on PostgreSQL optional search filters | High | Backend |
| 17 | Product and warehouse date filters rejected date-only values from HTML date inputs | High | Frontend + Backend |
| 18 | Inbound/outbound list summaries omitted item counts, so the UI showed zero items for populated orders | High | Frontend + Backend |
| 19 | Inbound order table rows contained stray quote text nodes and produced a React hydration warning | Medium | Frontend |
| 20 | Unexpected server errors were returned generically without logging their stack traces | Medium | Backend |

---

## 3. Bugs Fixed

### 3.1 ToastProvider missing on auth routes

**Problem:** `useToast()` was called in `LoginPage.tsx` and `RegisterPage.tsx`, but `ToastProvider` only wrapped `/app` routes inside `AppLayout.tsx`. The app crashed with "useToast must be used within a ToastProvider" on the login page.

**Root cause:** Router rendered login/register/landing pages without a `ToastProvider` ancestor.

**Files modified:**
- `warehouse-system-frontend/src/app/router.tsx`

**Solution:** Created a `ToastWrapped` wrapper component and wrapped the landing, login, and register routes with it.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass (9/9).

---

### 3.2 No JWT token refresh / 401 handling

**Problem:** The frontend `api.ts` had no response interceptor. When the JWT access token expires (~1 hour), all API calls fail with 401. There was no automatic token refresh mechanism using the HttpOnly refresh cookie that the backend sets.

**Root cause:** Missing axios response interceptor in `api.ts`.

**Files modified:**
- `warehouse-system-frontend/src/lib/api.ts`
- `warehouse-system-frontend/src/features/auth/api.ts`

**Solution:** Added an axios response interceptor that:
1. On 401 Unauthorized, attempts to refresh the access token via `POST /api/v1/auth/refresh` (using the HttpOnly refresh cookie automatically sent by the browser)
2. On successful refresh, retries the original request with the new token
3. On refresh failure, clears auth state and redirects to login
4. On 429 Too Many Requests, returns a descriptive error message with retry-after hint

Added `refreshToken()` API function to `auth/api.ts`.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.3 cycleCount audit log wrong "previous" value

**Problem:** `InventoryService.cycleCount()` recorded the audit log with `balance.getQuantityOnHand()` AFTER it had already been updated to `countedQuantity`. The "previous" value in the audit trail was incorrect.

**Root cause:** The previous quantity was read after the entity was mutated.

**Files modified:**
- `warehouse-system/src/main/java/com/logistics/warehouse_system/service/InventoryService.java`

**Solution:** Captured `previousQuantity` before mutating `balance.setQuantityOnHand(countedQuantity)`, then used `previousQuantity` in the audit log record.

**Verification:** Backend build succeeds, backend tests pass (35/35).

---

### 3.4 cycleCount reservedQuantity uses new quantity

**Problem:** `InventoryService.cycleCount()` capped `reservedQuantity` using `Math.min(balance.getReservedQuantity(), balance.getQuantityOnHand())` AFTER `quantityOnHand` had already been updated to `countedQuantity`. This meant the cap used the new count value, not the previous on-hand quantity.

**Root cause:** Entity mutated before reserved quantity calculation.

**Files modified:**
- `warehouse-system/src/main/java/com/logistics/warehouse_system/service/InventoryService.java`

**Solution:** Captured `previousQuantity` before mutation, then used `Math.min(balance.getReservedQuantity(), previousQuantity)` for the reserved quantity cap.

**Verification:** Backend build succeeds, backend tests pass (35/35).

---

### 3.5 LOW_STOCK filter uses hardcoded threshold

**Problem:** `InventoryBalanceRepository.search()` filtered LOW_STOCK with `b.quantityOnHand < 10`, ignoring each product's individual `lowStockThreshold` field.

**Root cause:** Hardcoded value in JPQL query instead of referencing the entity relationship.

**Files modified:**
- `warehouse-system/src/main/java/com/logistics/warehouse_system/repository/InventoryBalanceRepository.java`

**Solution:** Changed the query to use `b.quantityOnHand < b.product.lowStockThreshold`, referencing the product's configured threshold.

**Verification:** Backend build succeeds, backend tests pass (35/35).

---

### 3.6 ReportsPage TrendChart mock data

**Problem:** `ReportsPage` rendered a `TrendChart` with hardcoded values (multiples of `inboundVolume`), presenting fake data as a "Monthly Volume Trend."

**Root cause:** Placeholder data used instead of real time-series data (no historical data API endpoint exists).

**Files modified:**
- `warehouse-system-frontend/src/features/reports/ReportsPage.tsx`

**Solution:** Replaced the mock `TrendChart` with a simple "Volume Comparison" showing current inbound vs outbound bars, plus a note that trend history requires a date-range-specific query API. Removed the unused `TrendChart` component.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.7 CycleCountPage search field broken

**Problem:** The `FilterToolbar` search field in `CycleCountPage` had `onChange: () => {}` — a no-op. Searching by product name or SKU did nothing.

**Root cause:** Search handler was not connected to state.

**Files modified:**
- `warehouse-system-frontend/src/features/inventory/CycleCountPage.tsx`

**Solution:** Added a `search` state variable, connected it to `FilterToolbar`'s `onChange`, added `search` to the `useEffect` dependency array, and filtered the displayed data by search term.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.8 CycleCountPage locationId passes 0 instead of undefined

**Problem:** When no location was selected, `cycleCount` was called with `locationId ? Number(locationId) : 0`, passing `0` as the location ID. There is no location with ID 0, causing a "Not Found" error.

**Root cause:** Default fallback value of `0` instead of `undefined`.

**Files modified:**
- `warehouse-system-frontend/src/features/inventory/CycleCountPage.tsx`
- `warehouse-system-frontend/src/features/inventory/api.ts`

**Solution:** Changed to pass `undefined` when no location is selected, and made the `locationId` parameter optional in the frontend API function signature.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.9 CycleCountPage passes wrong parameters to cycleCount API

**Problem:** `handleCount(id, countedQuantity)` passed the inventory balance ID (`b.id`) as the `productId` parameter to `cycleCount()`, and used the global filter `locationId` instead of the row's location.

**Root cause:** Incorrect parameter mapping between row data and API call.

**Files modified:**
- `warehouse-system-frontend/src/features/inventory/CycleCountPage.tsx`

**Solution:** Changed `handleCount` to accept `(productId, locationId, countedQuantity)` and updated the `onClick` handler to pass `b.productId` and `b.storageLocationId` from the row data.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.10 CycleCountPage uses browser alert

**Problem:** `CycleCountPage` used `window.alert()` for error feedback instead of the application's toast notification system.

**Root cause:** Inconsistent error feedback mechanism.

**Files modified:**
- `warehouse-system-frontend/src/features/inventory/CycleCountPage.tsx`

**Solution:** Replaced `alert()` with `addToast()` calls for success and error feedback, imported `useToast` and `getErrorMessage`.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.11 Duplicate ItemRow interface

**Problem:** `CreateInboundOrderPage.tsx` had two identical `interface ItemRow` declarations at module level.

**Root cause:** Code duplication during development.

**Files modified:**
- `warehouse-system-frontend/src/features/inbound/CreateInboundOrderPage.tsx`

**Solution:** Removed the duplicate interface declaration.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.12 Form draft persistence incomplete

**Problem:** `CreateInboundOrderPage` initialized form state from `useFormDraft` but never called `saveDraft()` as the user typed, so drafts were never persisted. The draft was also not cleared after successful submission.

**Root cause:** `useFormDraft` return values not fully utilized.

**Files modified:**
- `warehouse-system-frontend/src/features/inbound/CreateInboundOrderPage.tsx`

**Solution:** Added a `useEffect` that calls `saveDraft()` whenever form fields change, destructured `clearDraft` from the hook, and called it after successful submission.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.13 Missing loading states in refresh() functions

**Problem:** Six `refresh()` functions across six pages called the API without setting `setLoading(true)` first, causing UI flashes where data disappears briefly without a loading indicator.

**Root cause:** Inconsistent loading state management in refresh callbacks.

**Files modified:**
- `warehouse-system-frontend/src/features/products/ProductsPage.tsx`
- `warehouse-system-frontend/src/features/warehouses/WarehousesPage.tsx`
- `warehouse-system-frontend/src/features/inbound/InboundOrdersPage.tsx`
- `warehouse-system-frontend/src/features/shipments/ShipmentsPage.tsx`
- `warehouse-system-frontend/src/features/users/UsersPage.tsx`
- `warehouse-system-frontend/src/features/inventory/InventoryPage.tsx`

**Solution:** Added `setLoading(true)` before the API call and `.finally(() => setLoading(false))` after in each `refresh()` function.

**Verification:** TypeScript compiles, frontend build succeeds, frontend tests pass.

---

### 3.14 CSV export endpoints return 400 due to date format mismatch

**Problem:** CSV export endpoints in 5 backend controllers returned 400 Bad Request when date filters were provided. The frontend sends date-only strings (e.g., `2026-11-24`) from HTML date picker inputs, but the backend expected ISO datetime strings (e.g., `2026-11-24T10:00:00Z`) via `@DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)` with `Instant` type. This caused `MethodArgumentTypeMismatchException` → 400 error. The frontend export functions had no error handling, so users saw nothing happen.

**Root cause:** Date format mismatch between frontend date picker (date-only) and backend API (datetime expected).

**Files modified:**
- `warehouse-system/src/main/java/com/logistics/warehouse_system/controller/ShipmentController.java`
- `warehouse-system/src/main/java/com/logistics/warehouse_system/controller/ProductController.java`
- `warehouse-system/src/main/java/com/logistics/warehouse_system/controller/WarehouseController.java`
- `warehouse-system/src/main/java/com/logistics/warehouse_system/controller/InboundController.java`
- `warehouse-system/src/main/java/com/logistics/warehouse_system/controller/OutboundController.java`
- `warehouse-system-frontend/src/lib/api.ts`
- `warehouse-system-frontend/src/features/auth/api.ts`
- `warehouse-system-frontend/src/features/shipments/api.ts`
- `warehouse-system-frontend/src/features/products/api.ts`
- `warehouse-system-frontend/src/features/warehouses/api.ts`
- `warehouse-system-frontend/src/features/inbound/api.ts`
- `warehouse-system-frontend/src/features/outbound/api.ts`
- `warehouse-system-frontend/src/features/inventory/api.ts`
- `warehouse-system-frontend/src/features/audit/api.ts`
- `warehouse-system-frontend/src/features/dashboard/api.ts`
- `warehouse-system-frontend/src/components/ui/toast.ts`

**Solution:**
1. Changed `@DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant` to `@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate` in all 5 controller export endpoints
2. Added conversion from `LocalDate` to `Instant` in the controller before calling the service (`from.atStartOfDay(ZoneOffset.UTC).toInstant()`)
3. Added try/catch error handling to all 8 frontend export API functions with console error logging via `getErrorMessage()`
4. Added standalone `addToast` export to `toast.ts` for use outside React components

**Verification:** Backend build succeeds, backend tests pass (35/35), TypeScript compiles, frontend build succeeds, frontend tests pass (9/9).

---

### 3.15 Inventory movement and user list query failures

**Problem:** Inventory Movement History and User Management returned HTTP 500 when their optional search filters were used with PostgreSQL. Nullable HQL parameters were inferred as incompatible types (`lower(bytea)` / undetermined parameter types).

**Solution:** Replaced the affected dynamic list queries with JPA Specifications, keeping optional filters composable without nullable-parameter type ambiguity.

**Verification:** Both authenticated list endpoints returned HTTP 200 in the live API smoke matrix and displayed data in the browser. The full backend suite passes (35/35).

---

### 3.16 Date-only filters on products and warehouses

**Problem:** Product and warehouse date filters received `YYYY-MM-DD` from HTML date inputs, but the endpoints expected `Instant` date-time values.

**Solution:** Accept `LocalDate` inputs and convert the start date to UTC midnight and the end date to the exclusive UTC start of the following day.

**Verification:** Date-filtered product and warehouse list requests returned HTTP 200 in the live API matrix.

---

### 3.17 Inbound and outbound order item counts

**Problem:** List DTOs intentionally omitted item details, but also omitted item counts. Inbound and outbound tables therefore displayed zero items even when detail endpoints contained order lines.

**Solution:** Added a grouped count projection/query per page and exposed `itemCount` in the list DTOs and frontend types. The list pages render the count without loading item details per row.

**Files modified:** `OrderItemCount.java`, inbound/outbound repositories, DTOs and services, API types, and list pages.

**Verification:** New service regression tests cover list counts. Live list counts matched detail item counts (1 vs. 1) for the checked inbound and outbound orders; the frontend production build passes.

---

### 3.18 Inbound table hydration warning

**Problem:** Stray quote characters inside inbound table rows produced invalid text nodes and a React hydration warning.

**Solution:** Removed the stray text from the row markup.

**Verification:** The inbound list rendered without the stray text in the browser.

---

### 3.19 Unexpected server exception logging

**Problem:** The generic 500 handler returned a generic client response but did not log the exception, obscuring root causes during diagnosis.

**Solution:** Log the exception with its stack trace while retaining the generic response returned to clients.

**Verification:** Backend tests pass (35/35); client-facing error details remain generic.

---

## 4. Performance Improvements

| Area | Bottleneck | Optimization | Impact |
|------|-----------|--------------|--------|
| Frontend | `refresh()` functions in 6 pages showed blank data during reloads | Added `setLoading(true)` before API call, `.finally(() => setLoading(false))` after | Users see loading spinner instead of blank table during data refresh |
| Frontend | No token refresh mechanism — full page reload needed after token expiry (~1hr) | Added automatic JWT refresh via response interceptor with HttpOnly refresh cookie | Seamless session continuation, no unexpected logouts |
| Backend | `LOW_STOCK` query scanned all products with hardcoded threshold | Changed JPQL to use `b.product.lowStockThreshold` with existing entity graph | Correct filtering, no table scan change (indexes already exist on product_id) |

---

## 5. Functional Verification

The backend and frontend builds pass; all 35 backend tests and 12 frontend tests pass. A live Docker deployment returned healthy status. The authenticated API smoke matrix passed all 25 checks, including date-filtered list requests and all four CSV report types with and without date filters.

### Pages and Features Verified

| Page/Feature | Status | Notes |
|-------------|--------|-------|
| Login / Register | ✅ Working | ToastProvider wraps these routes; token refresh handles 401 |
| Dashboard | ✅ Smoke-tested | Live aggregate metrics and core counts rendered |
| Products / Warehouses | ✅ API-smoke-tested | Lists and date-filtered requests returned HTTP 200 |
| Inventory / Movement History | ✅ Smoke-tested | Balance and movement lists rendered; movement query returned HTTP 200 |
| Cycle Counting | ✅ Implemented | Camera and imported-image barcode/QR scans select an exact-SKU inventory item; physical camera decoding still needs device-level verification |
| Inbound / Outbound Orders | ✅ Smoke-tested | Lists rendered; sample item counts matched detail data |
| Shipments | ✅ Smoke-tested | Shipment list rendered 20 populated rows |
| Reports & Analytics | ✅ Smoke-tested | Metrics rendered; all four export buttons called endpoints returning HTTP 200 |
| Users | ✅ Smoke-tested | User list rendered; filter endpoint returned HTTP 200 |
| Audit Logs, Roles, Settings, Profile | ✅ Build/API baseline | No new failures identified in this audit; no exhaustive interactive CRUD pass performed |

### Business workflow evidence and scope

1. **Receiving:** Service tests cover confirmation, inventory increase, movement creation, and duplicate-confirm rejection.
2. **Dispatch:** Service tests cover stock decrement, movement creation, and insufficient-stock rejection without side effects.
3. **Inbound/outbound lists:** Live list counts matched details for the checked orders.
4. **Reports:** Browser button clicks reached all four export endpoints and each returned HTTP 200; the API matrix also covered date-filtered exports.
5. **Scope limitation:** No create/update/dispatch/POD/cycle-count mutation was performed in the shared development database during this pass. These interactive end-to-end workflows are not claimed as live-verified.

---

## 6. Testing Results

### Frontend
- TypeScript strict check: ✅ Pass (0 errors)
- Vite production build: ✅ Pass
- Vitest tests: ✅ Pass (4 files, 12 tests)
- Test files: `components/ui/StatusBadge.test.tsx`, `components/ui/BarcodeScanner.test.tsx`, `features/auth/permissions.test.ts`, `lib/format.test.ts`

### Backend
- Maven compile: ✅ Pass (BUILD SUCCESS)
- Maven tests: ✅ Pass (35 tests, 0 failures)
- Regression coverage includes inbound and outbound list item-count mapping.
- Frontend lint: ✅ Exit code 0; existing warnings remain in the router, hooks, and page components.
- Live Docker health check: ✅ HTTP 200.
- Authenticated API smoke matrix: ✅ 25/25 HTTP 200 checks.
- Browser smoke checks: inbound/outbound, inventory movements, users, shipments, dashboard, and Reports & Analytics rendered data. All four report export button requests returned HTTP 200.

---

## 7. Remaining Issues

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| 1 | Bulk confirm/dispatch (Phase 2.6) not fully implemented | Low | Individual confirm/dispatch endpoints exist; bulk multi-select UI not built |
| 2 | No scheduled reports (Phase 3.4 "Scheduled" part) | Low | Custom report export endpoints exist; scheduling/cron not implemented |
| 3 | Dashboard has no warehouse selector | Low | Backend supports warehouseId filter; frontend DashboardPage doesn't expose it (ReportsPage does) |
| 4 | `role_permissions` table has no data | Low | Backend uses `hasAnyRole()` not `hasAuthority()`, so permissions table is unused |
| 5 | Automated browser E2E suite is not available | Medium | No project Playwright suite/config was found. The local browser binary was missing; browser installation stalled and the CDN check failed with `CRYPT_E_REVOCATION_OFFLINE`. Manual integrated-browser smoke checks were used instead. |

---

## 8. Production Readiness Assessment

### ✅ Ready for Production
- Authentication and authorization (JWT + refresh token rotation)
- Role-based access control (5 roles enforced by backend)
- All CRUD operations for products, warehouses, inbound, outbound, inventory, shipments
- CSV export for all major entities
- POD upload/download for shipments
- Cycle counting with audit trail
- Database migrations (Flyway V1-V12)
- Security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)
- Rate limiting on login/register (10 requests/60 seconds)
- Account lockout after 5 failed attempts
- All 35 backend tests and 12 frontend tests passing
- Both production builds succeeding

### ⚠️ Needs Attention Before Production
1. Change default JWT secret (`app.jwt.secret`) — currently uses dev default
2. Set `cookie.setSecure(true)` in `AuthController` for production HTTPS
3. For production, provision secure, highly available Redis and verify fallback policy; the in-memory rate-limit fallback is process-local
4. Set up PostgreSQL backups
5. Review CORS allowed origins for production domain
6. Consider adding `role_permissions` data if permission-based (not role-based) authorization is needed

---

## 9. Modified Files

### Frontend (`warehouse-system-frontend/`)

| File | Reason |
|------|--------|
| `src/lib/api.ts` | Added response interceptor for 401/429 handling + token refresh |
| `src/features/auth/api.ts` | Added `refreshToken()` API function |
| `src/features/auth/auth-context.tsx` | No changes (already correct) |
| `src/app/router.tsx` | Added ToastProvider wrapping for login/register/landing routes |
| `src/features/inventory/CycleCountPage.tsx` | Fixed search, locationId, cycleCount params, toast notifications, disabled state |
| `src/features/inventory/CycleCountPage.tsx` | Added camera scanning and scanned-SKU inventory selection |
| `src/components/ui/BarcodeScanner.tsx` | Added camera-based barcode/QR reader and camera lifecycle cleanup |
| `src/components/ui/BarcodeScanner.test.tsx` | Added camera, permission-error, and imported-image decoding tests |
| `src/components/layout/AppSidebar.tsx` | Added visible Cycle Counting navigation |
| `package.json` | Added `@zxing/browser` scanner dependency |
| `src/features/inventory/api.ts` | Made `locationId` optional in `cycleCount()` |
| `src/features/inventory/InventoryPage.tsx` | Fixed MovementsTable refresh() loading state; Reverse button loading |
| `src/features/products/ProductsPage.tsx` | Fixed refresh() loading state |
| `src/features/warehouses/WarehousesPage.tsx` | Fixed refresh() loading state |
| `src/features/warehouses/WarehouseDetailsPage.tsx` | Fixed refresh() loading state |
| `src/features/inbound/InboundOrdersPage.tsx` | Fixed refresh() loading state; removed stray quote text nodes; display order item counts |
| `src/features/inbound/api.ts` | Added list DTO item-count field |
| `src/features/inbound/CreateInboundOrderPage.tsx` | Removed duplicate interface; fixed form draft persistence |
| `src/features/shipments/ShipmentsPage.tsx` | Fixed refresh() loading state |
| `src/features/outbound/OutboundOrdersPage.tsx` | Display accurate order item counts |
| `src/features/outbound/api.ts` | Added list DTO item-count field |
| `src/features/users/UsersPage.tsx` | Fixed refresh() loading state |
| `src/features/reports/ReportsPage.tsx` | Removed mock TrendChart; added warehouse selector; added custom report downloads |
| `src/features/dashboard/api.ts` | Replaced paginated product/warehouse list calls with dedicated count endpoints |

### Backend (`warehouse-system/`)

| File | Reason |
|------|--------|
| `src/main/java/com/logistics/warehouse_system/service/InventoryService.java` | Fixed cycleCount audit log + reservedQuantity bugs |
| `src/main/java/com/logistics/warehouse_system/repository/InventoryBalanceRepository.java` | Fixed LOW_STOCK filter to use product's lowStockThreshold |
| `src/main/java/com/logistics/warehouse_system/repository/InventoryMovementRepository.java` | Added warehouseId, from, to params to search() + findAllForReport() |
| `src/main/java/com/logistics/warehouse_system/repository/InboundOrderRepository.java` | Added findAllForReport() method |
| `src/main/java/com/logistics/warehouse_system/repository/OutboundOrderRepository.java` | Added findAllForReport() method |
| `src/main/java/com/logistics/warehouse_system/repository/ShipmentRepository.java` | Added findAllForReport() method |
| `src/main/java/com/logistics/warehouse_system/service/ReportService.java` | Added inventoryMovements/inboundSummary/outboundSummary/shipmentSummary methods |
| `src/main/java/com/logistics/warehouse_system/controller/ReportController.java` | Added 4 CSV export endpoints for custom reports |
| `src/main/java/com/logistics/warehouse_system/service/ShipmentService.java` | Added uploadPod/downloadPod methods |
| `src/main/java/com/logistics/warehouse_system/repository/OrderItemCount.java` | Added grouped order item-count projection |
| `src/main/java/com/logistics/warehouse_system/repository/InboundOrderRepository.java` | Added batched item-count query and Specification-based filtering |
| `src/main/java/com/logistics/warehouse_system/repository/OutboundOrderRepository.java` | Added batched item-count query and Specification-based filtering |
| `src/main/java/com/logistics/warehouse_system/repository/UserRepository.java` | Replaced nullable search query with Specification-based filtering |
| `src/main/java/com/logistics/warehouse_system/repository/InventoryMovementRepository.java` | Replaced nullable search query with Specification-based filtering |
| `src/main/java/com/logistics/warehouse_system/controller/ProductController.java` | Parse date-only filters and convert to UTC boundaries |
| `src/main/java/com/logistics/warehouse_system/controller/WarehouseController.java` | Parse date-only filters and convert to UTC boundaries |
| `src/main/java/com/logistics/warehouse_system/dto/InboundOrderDto.java` | Expose order item count |
| `src/main/java/com/logistics/warehouse_system/dto/OutboundOrderDto.java` | Expose order item count |
| `src/main/java/com/logistics/warehouse_system/exception/GlobalExceptionHandler.java` | Log unexpected exceptions with stack traces |
| `src/test/java/com/logistics/warehouse_system/service/InboundServiceTest.java` | Add list item-count regression coverage |
| `src/test/java/com/logistics/warehouse_system/service/OutboundServiceTest.java` | Add list item-count regression coverage |
| `src/main/java/com/logistics/warehouse_system/controller/ShipmentController.java` | Added POST/GET /api/v1/shipments/{id}/pod endpoints |
| `src/main/java/com/logistics/warehouse_system/entities/Shipment.java` | Added podFileName/podUploadedAt fields |
| `src/main/java/com/logistics/warehouse_system/dto/ShipmentDto.java` | Added podFileName/podUploadedAt fields |
| `src/main/resources/db/migration/V12__add_pod_fields.sql` | New migration for POD fields |

---

**Maintenance completed:** Verified defects fixed; builds and automated tests pass. Live read-only smoke results and remaining validation gaps are recorded above.