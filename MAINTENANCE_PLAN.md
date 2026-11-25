# LogiTrack Maintenance Plan

## 1. Inspection priorities

- Verify the frontend route, auth, form, modal, table, export, and notification flows.
- Trace inbound, outbound, inventory, shipment, report, user, and audit operations through the API and database.
- Inspect transaction boundaries and inventory invariants for receiving, dispatch, reservation, adjustment, cycle count, and reversal.
- Verify role guards and backend authorization remain consistent.
- Measure build/test baselines and inspect the production bundle for avoidable regressions.

## 2. Phased work

1. **Phase 1 - Inspection and diagnosis:** complete baseline builds/tests, inspect recent changes, and document verified defects.
2. **Phase 2 - Critical fixes:** fix crashes, authentication/API contract defects, backend authorization/data-integrity issues, and broken inventory operations.
3. **Phase 3 - Performance:** address clearly identified bottlenecks without broad or speculative rewrites.
4. **Phase 4 - Functional completion:** complete the button/form/navigation/export audit and remove broken interaction paths.
5. **Phase 5 - Regression:** rerun frontend and backend validation, Docker configuration checks, and critical workflows.
6. **Phase 6 - Reporting:** update `MAINTENANCE_REPORT.md` with evidence, limitations, and remaining issues.

## 3. Critical workflows

- Login, logout, refresh, and role-restricted navigation.
- Product, warehouse, and storage-location CRUD.
- Inbound creation and confirmation.
- Inventory adjustment, cycle count, reservation, and reversal.
- Outbound creation, dispatch, insufficient-stock failure, and cancellation.
- Shipment creation, status transitions, split operations, and POD upload/download.
- Dashboard, reports, CSV exports, audit logs, and user management.

## 4. Known risk areas

- Large frontend bundle reported during the baseline build.
- Front effect/state patterns may produce extra requests or cascading renders.
- Inventory balances use optimistic versioning; concurrent operations must not produce negative or inconsistent stock.
- Docker Compose includes Redis and `RateLimitFilter` uses it with an in-memory fallback; production should validate secured/high-availability Redis and fallback behavior.
- Existing worktree changes must be preserved and tested before additional fixes are made.
