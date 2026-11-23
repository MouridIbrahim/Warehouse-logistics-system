# Frontend Filtering System - Task Plan

## Current State Discovered
- Frontend pages had ad-hoc search (client-side debounced input in Products, Warehouses, Users)
- Some pages had server-side status filters (Inbound, Outbound, Shipments, Audit)
- Inventory filtered client-side only (no server-side search)
- No reusable filter toolbar component existed
- Each page managed its own filter state independently
- Backend endpoints already supported some query params (term, status, productId, locationId, entityType, action)
- Missing backend filters: Inbound/Outbound/Shipment `term` search, User `role`/`active`, Audit `actorUserId`/date range, Product `unitOfMeasure`/`active`/date range, Warehouse `active`/date range, Inventory `quantityCondition`

## Implementation Summary

### Backend Changes (20 files modified)
All filters use parameterized JPA queries (no SQL injection), respect existing `@PreAuthorize` security, and return consistent `PageResponse` pagination.

**Products** (`GET /api/v1/products`): `term`, `unitOfMeasure`, `active`, `from`, `to`
- ProductRepository: Added `search()` JPQL with ILIKE on sku/name, exact match on unitOfMeasure/active, date range on createdAt
- ProductService: `list(term, unitOfMeasure, active, from, to, pageable)`
- ProductController: Added `@RequestParam` for all new params

**Warehouses** (`GET /api/v1/warehouses`): `term`, `active`, `from`, `to`
- WarehouseRepository: Added `search()` JPQL with ILIKE on code/name, exact match on active, date range on createdAt
- WarehouseService: `list(term, active, from, to, pageable)`
- WarehouseController: Added `@RequestParam` for all new params

**Inbound Orders** (`GET /api/v1/inbound-orders`): `term`, `status`, `warehouseId`, `from`, `to`
- InboundOrderRepository: Extended `search()` with warehouseId FK filter, date range on createdAt
- InboundService: `list(term, status, warehouseId, from, to, pageable)`
- InboundController: Added `@RequestParam` for warehouseId, from, to

**Outbound Orders** (`GET /api/v1/outbound-orders`): `term`, `status`, `warehouseId`, `from`, `to`
- OutboundOrderRepository: Extended `search()` with warehouseId FK filter, date range on createdAt
- OutboundService: `list(term, status, warehouseId, from, to, pageable)`
- OutboundController: Added `@RequestParam` for warehouseId, from, to

**Shipments** (`GET /api/v1/shipments`): `term`, `status`, `from`, `to`
- ShipmentRepository: Extended `search()` with date range on createdAt
- ShipmentService: `list(term, status, from, to, pageable)`
- ShipmentController: Added `@RequestParam` for from, to

**Users** (`GET /api/v1/users`): `term`, `role`, `active`
- UserRepository: Extended `search()` with role join filter, active boolean filter
- UserService: `list(term, role, active, pageable)`
- UserController: Added `@RequestParam` for role, active

**Inventory Balances** (`GET /api/v1/inventory`): `productId`, `locationId`, `quantityCondition`
- InventoryBalanceRepository: Extended `search()` with quantityCondition (LOW_STOCK < 10, OUT_OF_STOCK = 0, IN_STOCK > 0)
- InventoryService: `listBalances(productId, locationId, quantityCondition, pageable)`
- InventoryController: Added `@RequestParam quantityCondition`

**Audit Logs** (`GET /api/v1/audit-logs`): `entityType`, `action`, `actorUserId`, `from`, `to`
- AuditLogRepository: Changed to `JpaSpecificationExecutor` with Specification-based dynamic filtering
- AuditLogService: `list(entityType, action, actorUserId, from, to, pageable)` using Specification
- AuditController: Added `@RequestParam actorUserId, from, to`

### Frontend Components Created (4 files)
1. `src/hooks/useFilters.ts` - Reusable filter state hook with debounced search (400ms default)
2. `src/components/ui/filter/FilterToolbar.tsx` - Main toolbar with search, selects, date range, reset button
3. `src/components/ui/filter/ActiveFilterChips.tsx` - Removable filter chips display + Clear All
4. `src/components/ui/filter/index.ts` - Barrel export

### Pages Integrated with FilterToolbar (9 pages)
1. **ProductsPage** - search, unitOfMeasure select, active select, date range
2. **WarehousesPage** - search, active select, date range
3. **InboundOrdersPage** - search, status select, warehouse dropdown (fetched from API), date range
4. **OutboundOrdersPage** - search, status select, warehouse dropdown (fetched from API), date range
5. **ShipmentsPage** - search, status select, date range
6. **InventoryPage (BalancesTab)** - search (client-side), productId, locationId, quantityCondition select (Low Stock/Out of Stock/In Stock)
7. **InventoryPage (MovementsTab)** - productId, locationId
8. **UsersPage** - search, role select (fetched from roles API), active select
9. **AuditLogsPage** - entityType select, action select, actor dropdown (fetched from users API), date range

### Database Changes
None - all filters map to existing entity fields.

### Tests Executed
- Backend: 30/30 tests pass (`./mvnw.cmd test`)
- Frontend: 9/9 tests pass (`npm test`)
- Frontend build: ✅
- TypeScript strict: ✅
- Lint: No new errors (only pre-existing warnings)

### Filter Behavior
- Multiple filters combine with AND logic (server-side)
- Search + filters work together server-side
- Changing a filter refreshes data and resets to page 1
- Clearing one filter preserves others; Clear All resets everything
- Active filters shown as removable chips
- Empty state displayed when no results match
- Debounced search (400ms) to avoid unnecessary API requests
- All filters respect existing authentication and role-based access
- Date range uses ISO date strings converted to Instant on backend
- `prefers-reduced-motion` respected in Motion animations (from previous task)