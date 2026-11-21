# Frontend Task Plan

Execution checklist for the frontend of the Logistics Transit Warehouse
Operation and Maintenance System. This is a checklist, not a
specification. Authoritative specifications: `docs/PROJECT_DETAILS.md`
and `docs/FRONTEND.md`. The backend contract is in `backend_task.md` §6.

## 1. Current state

- `warehouse-system-frontend/` contains only `FRONTEND.md`. No Vite
  project, `package.json`, `src/`, or config exists yet.
- Backend is not yet implemented; API integration must follow the agreed
  contract in `backend_task.md`.

## 2. Confirmed decisions (see docs/PROJECT_DETAILS.md §9)

- React + TypeScript + Vite; runs locally outside Docker.
- Screens: sign-in, dashboard, products, warehouses/locations, inbound,
  inventory, outbound, shipments, reports, user/role administration,
  audit history, access-denied/not-found.
- Whole-number quantities; single warehouse (UI can still scope by
  warehouse); no partial receive/dispatch, no approval step, no transfers.
- Shipment statuses: PENDING, PREPARED, IN_TRANSIT, DELIVERED, DELAYED,
  CANCELLED.
- JWT bearer-token auth (contract from backend; token kept in memory or
  sessionStorage per backend guidance — confirm exact storage strategy).

## 3. Conventions and design notes

- Feature-oriented structure per `docs/FRONTEND.md` §3; shared UI in
  `components/ui`, layout in `components/layout`.
- API base URL from `VITE_API_BASE_URL` (default `http://localhost:8080`).
- One HTTP client/API layer; typed request/response models; no `any`.
- Backend is authoritative: never compute inventory totals, permissions,
  or business rules solely in the browser.
- Tables need loading/empty/error/filter/sort/pagination states; confirm
  destructive actions; accessible controls; restrained light theme.

## 4. Task list

Status legend: `TODO` / `IN_PROGRESS` / `BLOCKED` / `DONE`.

### Phase 0 — Scaffolding

- **FE-001** — Vite + TS project setup. `TODO`
  - Objective: `package.json`, `vite.config.ts`, `tsconfig` (strict),
    `index.html`, `src/main.tsx`, `.env.example`, lint config.
  - Acceptance: `npm install`, `npm run dev`, type check, and build all
    succeed.
  - Verify: `npm run build`, `npx tsc --noEmit`.

- **FE-002** — App shell, router, providers. `TODO`
  - Objective: React Router with protected/role-aware routes, an
    auth/theme provider, base layout (sidebar nav + topbar).
  - Acceptance: navigation map from §2 renders; unknown routes show
    not-found; protected routes redirect to sign-in.

### Phase 1 — API layer and auth

- **FE-003** — HTTP client + typed API modules. `TODO`
  - Objective: shared `fetch`/axios wrapper with auth header injection,
    error normalization, and per-feature API modules matching the backend
    contract.
  - Acceptance: 401/403/409/validation errors surface as typed messages;
    base URL read from env.

- **FE-004** — Authentication flow. `TODO`
  - Objective: sign-in page, auth context/state, token handling, logout,
    session expiry handling.
  - Acceptance: login/logout work; protected routes gate on auth; token
    storage follows backend contract; no secrets in localStorage.

### Phase 2 — Reusable UI

- **FE-005** — UI primitives. `TODO`
  - Objective: buttons, inputs, selects, modal/confirm, toast/feedback,
    status badges, table with pagination/sort/filter, empty/error/loading
    states.
  - Acceptance: consistent, accessible components used across features.

### Phase 3 — Feature screens (page + forms + API wiring)

- **FE-006** — Dashboard. `TODO`
  - Objective: operational summary cards + report figures from
    `/reports/dashboard`; date-range filters.
  - Acceptance: real data only; no static mock metrics.
- **FE-007** — Products. `TODO` — CRUD + deactivate + search; SKU
  uniqueness error shown.
- **FE-008** — Warehouses & locations. `TODO` — warehouse CRUD; locations
  scoped per warehouse.
- **FE-009** — Inbound. `TODO` — create draft, add items, confirm;
  success/failure feedback; quantity validation.
- **FE-010** — Inventory. `TODO` — balances list/filter/paginate;
  movement history; authorized manual adjustment.
- **FE-011** — Outbound. `TODO` — create draft, dispatch; show conflict
  on insufficient stock without partial dispatch.
- **FE-012** — Shipments. `TODO` — create, list, status updates via the
  allowed transitions only; status history view.
- **FE-013** — Reports. `TODO` — the five mandatory reports with filters.
- **FE-014** — User & role administration. `TODO` — admin-only; CRUD,
  activate/deactivate, role assignment.
- **FE-015** — Audit history. `TODO` — read-only, paginated/filtered.
- **FE-016** — Role-aware navigation & guards. `TODO`
  - Objective: hide/disable actions by role for usability; access-denied
    screen on 403.
  - Acceptance: a Viewer/Auditor sees read-only views; backend still
    enforces (frontend hiding is not security).

### Phase 4 — Quality

- **FE-017** — Frontend tests. `TODO`
  - Objective: form validation/error display, protected routes/role-aware
    nav, loading/empty/error states, API error handling, critical flows.
  - Acceptance: tests run and pass; no unexecuted tests reported as
    passing.
- **FE-018** — Build + manual verification. `TODO`
  - Objective: type check, lint, production build, and manual run-through
    of primary workflows against a running backend.
  - Verify: `npx tsc --noEmit`, lint, `npm run build`, manual checklist.

## 5. API dependencies and questions for the backend

- Confirm exact auth response shape (token field, expiry) and token
  storage guidance (memory vs sessionStorage).
- Confirm pagination envelope and error envelope field names.
- Confirm DTO field names for each resource before integration.
- Confirm shipment status transition list matches the UI dropdown.

## 6. Assumptions and open items

- Assumptions: token stored in memory (or sessionStorage) with an
  interceptor, per backend guidance; a lightweight table/form approach
  without a heavy UI framework unless the repo already has one.
- Open: none beyond the backend contract items in §5.

## 7. Progress

| Task | Status | Notes |
|---|---|---|
| FE-001 … FE-018 | TODO | Not started |
