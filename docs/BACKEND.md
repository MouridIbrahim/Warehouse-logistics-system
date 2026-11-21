# Backend Implementation Guide

## 1. Purpose

This document defines the backend implementation for the Logistics
Transit Warehouse Operation and Maintenance System.

The backend uses **Java 25 + Spring Boot 4**, PostgreSQL, Spring Data
JPA / Hibernate, Maven, and Flyway. Use a **modular monolith**: one
deployable Spring Boot application organized into clear business
modules.

Read `PROJECT_DETAILS.md` and `DATABASE.md` before implementation.
Backend business rules and persisted data are authoritative; the
frontend must not be trusted to enforce them.

## 2. Technology requirements

-   Java 25
-   Spring Boot 4
-   Maven
-   Spring Web for REST APIs
-   Spring Data JPA / Hibernate for persistence
-   PostgreSQL driver
-   Flyway for schema migrations
-   Bean Validation for request validation
-   Spring Security for authentication and authorization
-   OpenAPI / Swagger UI for API documentation
-   JUnit 5, Mockito, and Spring Boot Test

Use compatible dependency versions managed by the selected Spring Boot
release. Do not add libraries without a clear need.

## 3. Architecture

Use a modular monolith, not microservices.

Suggested package structure (adapt to the existing codebase):

``` text
backend/
├── src/main/java/.../
│   ├── config/
│   ├── common/
│   │   ├── exception/
│   │   ├── response/
│   │   └── validation/
│   ├── security/
│   ├── auth/
│   ├── user/
│   ├── product/
│   ├── warehouse/
│   ├── inbound/
│   ├── inventory/
│   ├── outbound/
│   ├── shipment/
│   ├── report/
│   └── audit/
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
├── src/test/java/
├── Dockerfile
└── pom.xml
```

Keep each module's controller, service, repository, DTOs, mapper, and
domain logic organized together where appropriate. Shared code should
remain small and genuinely reusable.

## 4. Layer responsibilities

-   **Controller:** HTTP mapping, request/response handling, status
    codes. Keep business logic out.
-   **DTO:** API request and response contracts. Do not expose JPA
    entities directly.
-   **Service:** business rules, authorization-sensitive operations,
    transaction boundaries, orchestration.
-   **Repository:** database access and focused queries.
-   **Entity:** persistence mapping and entity relationships.
-   **Mapper:** explicit conversion between entities and DTOs.
-   **Security:** authentication, authorization, password hashing, and
    security configuration.
-   **Exception handling:** consistent API error responses.

Avoid giant service classes, generic repositories that hide business
intent, and unnecessary abstraction layers.

## 5. Suggested backend modules

-   Authentication and users
-   Roles and permissions
-   Products
-   Warehouses and storage locations
-   Inbound operations
-   Inventory and inventory movements
-   Outbound operations
-   Shipments and status history
-   Reports
-   Audit logging

The final module boundaries must reflect the approved requirements and
existing code.

## 6. REST API design

-   Use resource-oriented REST endpoints and consistent naming.
-   Use DTOs for all external request/response contracts.
-   Use appropriate HTTP methods and status codes.
-   Validate request bodies and path/query parameters.
-   Provide pagination and filtering for large collections.
-   Return consistent error structures.
-   Document endpoints with OpenAPI annotations/configuration.
-   Avoid exposing internal database IDs or fields unless they are part
    of the agreed API contract.
-   Coordinate API contracts with the frontend agent before integration.

Possible resource families (illustrative only; not a final API
contract): - `/api/v1/auth` - `/api/v1/users` - `/api/v1/roles` -
`/api/v1/products` - `/api/v1/warehouses` - `/api/v1/inbound-orders` -
`/api/v1/inventory` - `/api/v1/outbound-orders` - `/api/v1/shipments` -
`/api/v1/reports` - `/api/v1/audit-logs`

Do not implement every illustrative endpoint without checking the
approved scope.

## 7. Persistence and transactions

-   PostgreSQL is the system of record.
-   Use Flyway migrations as the authoritative schema-change mechanism.
-   Do not rely on Hibernate automatic schema creation/update in
    production.
-   Use explicit transaction boundaries for business operations.
-   Keep database constraints aligned with application validation.
-   Avoid N+1 query problems; fetch only the data needed for a use case.
-   Use pagination for potentially large results.
-   Avoid deleting historical records that are referenced by operational
    history.

### Inventory-critical operations

Receiving, dispatch, stock transfer, and authorized adjustment
operations must preserve consistency.

-   Update inventory balance and insert its movement record in the same
    transaction.
-   Validate that the requested quantity is valid.
-   Prevent negative inventory.
-   Protect against concurrent updates using an appropriate strategy
    such as pessimistic row locking, optimistic locking with
    retry/conflict handling, or a safe conditional update.
-   Do not trust a stock quantity previously displayed in the frontend.
-   Define when stock becomes available, reserved, or dispatched based
    on approved business rules.
-   Return a clear conflict/business error when stock is insufficient or
    another operation has changed the balance.
-   Test concurrent requests and rollback behavior.

## 8. Docker and PostgreSQL connection

### Required development arrangement

-   PostgreSQL runs in a Docker container.
-   Spring Boot backend runs in a Docker container.
-   Both services are managed by Docker Compose and share its default
    internal network.
-   React/Vite runs locally outside Docker during development.

Inside the backend container, connect to PostgreSQL using the Compose
**service name** as the hostname:

``` text
jdbc:postgresql://db:5432/logistics_db
```

Do not use `localhost` for the database host from inside the backend
container. In that context, `localhost` means the backend container
itself.

When running Spring Boot directly on the developer's computer (outside
Docker), use the published database port:

``` text
jdbc:postgresql://localhost:5432/logistics_db
```

Prefer environment-variable configuration, for example:

``` yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/logistics_db}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
```

Use a local `.env` file or another secure environment configuration for
development. Never commit real passwords, tokens, or production
credentials.

Compose example (illustrative; align names with the actual repository):

``` yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: logistics_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d logistics_db"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/logistics_db
      DB_USERNAME: postgres
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

The example is a starting point, not a complete production deployment.
Use a non-root database user, strong secrets, restricted port exposure,
backups, and production-appropriate health/restart settings before
deployment.

## 9. Configuration and environments

-   Separate development, test, and production configuration.
-   Use environment variables for credentials and environment-specific
    URLs.
-   Commit `.env.example` with placeholder values only.
-   Add `.env`, local secret files, and generated credentials to
    `.gitignore`.
-   Do not log passwords, access tokens, refresh tokens, or sensitive
    personal data.
-   Ensure Flyway migrations run in a controlled and observable way.

## 10. API documentation and integration

-   Maintain OpenAPI documentation for implemented endpoints.
-   Treat request/response DTOs as shared contracts with the frontend.
-   Include validation constraints and representative error responses.
-   Notify the frontend agent when endpoint paths, DTOs, auth behavior,
    or status codes change.
-   Do not claim an endpoint exists until implemented and verified.

## 11. Backend quality requirements

-   Unit-test business rules.
-   Integration-test repositories and service workflows against
    PostgreSQL where practical.
-   Test transaction rollback and inventory concurrency.
-   Test authentication and role permissions.
-   Verify migrations on a clean database and an existing database.
-   Run Maven tests and package/build commands.
-   Keep logs useful and avoid sensitive data.

## 12. Required backend task plan: `backend_task.md`

After inspecting the repository and this document, the backend AI agent
**must create or update a file named `backend_task.md` in the repository
root before substantial implementation begins**.

The task file must: 1. Describe the current backend state discovered by
inspecting the codebase. 2. List implementation phases in dependency
order. 3. Break each phase into small, actionable tasks with stable IDs
(for example `BE-001`). 4. For each task, include objective, affected
modules/files (if known), dependencies, acceptance criteria, and
verification commands/tests. 5. Mark each task as `TODO`, `IN_PROGRESS`,
`BLOCKED`, or `DONE`. 6. Identify database migration requirements and
API contracts. 7. Identify frontend integration dependencies and
questions. 8. Identify assumptions and unresolved product decisions
rather than silently deciding them. 9. Include a progress section and
update task status as work proceeds. 10. Keep completed tasks as
history; do not erase them. 11. Avoid copying this entire guide. The
task file is an execution checklist, not a replacement specification.

The agent must present the proposed plan and blocking questions before
starting a large implementation. It may proceed with independent,
low-risk setup tasks when no approval is needed.

## 13. Agent workflow

1.  Read all five project documents.
2.  Inspect the current backend repository and build configuration.
3.  Create/update `backend_task.md`.
4.  Confirm domain rules and database design before writing migrations.
5.  Agree API contracts with the frontend agent.
6.  Implement small tasks in dependency order.
7.  Run relevant tests after each meaningful change.
8.  Update `backend_task.md` with progress and blockers.
9.  Report changed files, migrations, API changes, test results, and
    unresolved issues.
