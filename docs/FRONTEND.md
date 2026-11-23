# Frontend Implementation Guide

## 1. Purpose

This document defines how to build the frontend for the Logistics
Transit Warehouse Operation and Maintenance System.

The frontend uses **React + TypeScript + Vite**. It runs locally during
development and communicates with the Spring Boot REST API. The frontend
is not required to run inside Docker in the development setup.

Read `PROJECT_DETAILS.md` first. The frontend must implement the
approved workflows and must not invent business rules.

## 2. Technology requirements

-   React
-   TypeScript with strict type checking
-   Vite
-   React Router (or another routing solution only if already
    established in the repository)
-   A consistent HTTP client and API layer
-   A consistent form and validation approach
-   A maintainable component and styling system

Do not add a large UI framework, state-management library, or dependency
without checking the existing repository and explaining why it is
needed. Reuse existing choices where possible.

## 3. Architecture and organization

Use a feature-oriented structure. Adapt names to the existing repository
rather than forcing a destructive restructure.

Suggested structure:

``` text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   └── config/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── warehouses/
│   │   ├── inbound/
│   │   ├── inventory/
│   │   ├── outbound/
│   │   ├── shipments/
│   │   ├── reports/
│   │   └── audit/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

A feature may contain its own pages, components, API functions, types,
hooks, and validation schemas. Keep shared UI primitives in
`components/ui` and shared application layout in `components/layout`.

## 4. Expected screens and navigation

Create only screens required by the approved scope. A suggested
navigation map is:

-   Register (first administrator)
-   Sign in
-   Dashboard
-   Products / Goods
-   Warehouses and storage locations
-   Inbound records
-   Inventory
-   Outbound orders
-   Shipments
-   Reports
-   User and role administration
-   Audit history
-   Access denied / not found

Use role-aware navigation for usability, but remember that hiding a menu
item is not security. The backend must enforce permissions.

## 5. UI and UX expectations

-   Build a professional, modern, clean business application.
-   Prefer a light, readable interface with restrained colors and clear
    hierarchy.
-   Use consistent spacing, typography, borders, radii, buttons, form
    controls, tables, and status indicators.
-   Avoid excessive gradients, neon colors, glassmorphism, oversized
    empty dashboard cards, and decorative effects that reduce usability.
-   Make tables usable with loading, empty, error, filtering, sorting
    (where supported), and pagination states.
-   Confirm destructive or high-impact actions.
-   Provide clear success and failure feedback.
-   Use accessible labels, keyboard focus states, semantic controls, and
    sufficient contrast.
-   Support common desktop and tablet widths; ensure essential pages
    remain usable on smaller screens.

Do not use fake metrics or static placeholder records in
production-facing screens. Clearly label any demo seed data.

## 6. API integration

-   The Spring Boot backend is the source of truth for business rules
    and persisted data.
-   Keep API calls in feature API modules or a shared API service layer;
    do not scatter raw `fetch`/Axios calls through components.
-   Read the API base URL from an environment variable such as
    `VITE_API_BASE_URL`.
-   Provide `.env.example` with a safe local example; never commit
    secrets.
-   Agree request/response DTOs with the backend agent before
    implementing integration.
-   Handle loading, empty, validation, unauthorized, forbidden,
    not-found, conflict, rate-limited (429), and server-error responses.
-   Avoid assuming response shapes. Use the actual documented OpenAPI
    contract or agreed DTOs.
-   Use pagination and filters supported by the API rather than
    downloading all records.
-   Do not calculate authoritative inventory totals, order totals, or
    permissions only in the browser.

Development connection: - If the backend is published on host port 8080,
the local Vite frontend can use `http://localhost:8080` as its API base
URL. - Configure CORS on the backend for the actual local frontend
origin. - Do not use Docker service hostname `backend` from the browser;
that hostname is only resolvable inside the Docker network.

## 7. Authentication and authorization behavior

-   On first use, show the registration screen: the first registered user
    becomes the administrator via `POST /api/v1/auth/register`. Once an
    administrator exists, the backend rejects further registration (409),
    so hide or disable the registration screen accordingly.
-   Provide a change-password form for the signed-in user
    (`POST /api/v1/auth/change-password`), and an administrator-only
    reset in the user management screen
    (`PATCH /api/v1/users/{id}/password`).
-   Handle `429 Too Many Requests` on the sign-in/registration forms —
    the backend rate-limits those endpoints; show a friendly retry
    message instead of failing silently.
-   Follow the authentication contract defined by the backend.
-   Do not invent token storage or refresh behavior.
-   Do not store passwords or secrets in browser storage.
-   If the backend uses secure HttpOnly cookies, configure the HTTP
    client to send credentials and configure CORS/CSRF appropriately.
-   If the backend uses bearer tokens, follow the agreed token lifecycle
    and storage strategy.
-   On authentication expiry, follow the documented refresh/logout flow.
-   Display only actions the current user is allowed to use, while
    relying on backend authorization for actual enforcement.
-   Do not treat a role value supplied by the browser as trusted
    authorization evidence.

## 8. Forms and validation

-   Validate required fields and basic formats in the frontend for fast
    feedback.
-   Backend validation remains authoritative.
-   Show field-level validation messages where possible.
-   Prevent accidental double submissions.
-   Represent quantities with appropriate numeric controls and reject
    invalid or non-positive values when the business rule requires it.
-   Do not permit a UI action to bypass server-side inventory checks.
-   Preserve user-entered values when a recoverable API error occurs.

## 9. State and data handling

-   Keep server data, temporary UI state, and form state conceptually
    separate.
-   Reuse existing state-management conventions in the repository.
-   Avoid duplicating server state in multiple unrelated stores.
-   Invalidate or refresh affected data after mutations.
-   Avoid optimistic inventory updates unless rollback and conflict
    handling are implemented correctly.
-   Use typed request and response models; avoid `any`.
-   Keep date/time formatting consistent and respect the API's timezone
    contract.

## 10. Frontend quality checks

At minimum: - TypeScript type checking. - Linting if configured. -
Production build. - Tests for important reusable components and feature
behavior where test infrastructure exists. - Manual verification of
primary workflows against a running backend.

Do not claim a test passed unless it was actually run.

## 11. Required frontend task plan: `front_end_task.md`

After inspecting the repository and this document, the frontend AI agent
**must create or update a file named `front_end_task.md` in the
repository root before substantial implementation begins**.

The task file must: 1. Describe the current frontend state discovered by
inspecting the codebase. 2. List implementation phases in dependency
order. 3. Break each phase into small, actionable tasks with stable IDs
(for example `FE-001`). 4. For each task, include its objective,
affected areas/files (if known), dependencies, acceptance criteria, and
verification commands or manual checks. 5. Mark each task as `TODO`,
`IN_PROGRESS`, `BLOCKED`, or `DONE`. 6. Identify API dependencies and
questions for the backend agent. 7. Identify assumptions and unresolved
product decisions instead of silently deciding them. 8. Include a
progress section and update task status as work proceeds. 9. Keep
completed tasks in the file; do not erase the history of what was
completed. 10. Avoid duplicating this entire guide. The task file is an
execution checklist, not a replacement specification.

The agent must present the proposed plan and any blocking questions
before starting a large implementation. It may proceed with independent,
low-risk setup tasks when no approval is needed.

## 12. Agent workflow

1.  Read `PROJECT_DETAILS.md`, `FRONTEND.md`, `BACKEND.md`,
    `DATABASE.md`, and `SECURITY_AND_TESTING.md`.
2.  Inspect the current frontend repository.
3.  Create/update `front_end_task.md`.
4.  Confirm API contracts with the backend plan or OpenAPI
    specification.
5.  Implement one task at a time.
6.  Run type checks, lint, tests, and build as applicable.
7.  Update `front_end_task.md` after each completed or blocked task.
8.  Summarize changed files, behavior, test results, and remaining work.
