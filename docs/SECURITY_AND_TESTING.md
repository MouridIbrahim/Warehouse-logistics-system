# Security and Testing Requirements

## 1. Purpose

This document defines security, data-protection, and quality
requirements for the Logistics Transit Warehouse Operation and
Maintenance System.

Security must be enforced in the backend. Frontend restrictions are
usability features, not security controls.

## 2. Authentication

-   Use Spring Security.
-   Store passwords only as secure password hashes using a modern
    adaptive password encoder such as BCrypt.
-   Never store or log plaintext passwords.
-   Define the authentication mechanism before implementation: secure
    session cookies or JWT-based authentication.
-   Do not combine approaches casually or invent refresh-token behavior.
-   If JWT is selected, define access-token expiry, refresh-token
    rotation/storage, revocation, logout, and browser storage strategy.
-   If cookies are selected, configure HttpOnly, Secure, SameSite, CSRF,
    and CORS correctly for the deployment model.
-   Return generic authentication failure messages where detailed
    messages could reveal account information.
-   Apply sensible rate limiting or throttling to authentication
    endpoints if the deployment environment supports it.

## 3. Authorization and roles

Enforce authorization on every protected backend endpoint and sensitive
service operation. Deny access by default. Do not trust role names or
permissions sent by the frontend. The frontend may hide or disable
unavailable actions for usability, but the backend is authoritative.

### 3.1 Baseline role catalogue

Use the following five roles consistently:

- **ADMINISTRATOR** — user and role administration, system
  configuration, all operational modules, and audit review.
- **WAREHOUSE_MANAGER** — oversight of products, warehouse/location
  records, inbound, inventory, outbound, operational reports, and
  relevant history.
- **WAREHOUSE_EMPLOYEE** — day-to-day receiving, storage/location
  assignment, picking, and dispatch tasks; no user/role administration
  or system configuration.
- **SHIPMENT_MANAGER** — shipment creation/maintenance, tracking details,
  valid shipment status updates, and read access to related outbound
  information; no direct inventory adjustment.
- **VIEWER_AUDITOR** — read-only access to permitted operational records,
  reports, and audit history; no write operations.

### 3.2 Initial permission matrix

This is the starting authorization policy. Implement permissions in
backend services and endpoint security, not just in the React UI.
Where a cell says "limited", grant only the operations required for the
employee's assigned workflow. Do not interpret it as unrestricted
administration.

| Capability | Administrator | Warehouse Manager | Warehouse Employee | Shipment Manager | Viewer / Auditor |
|---|---|---|---|---|---|
| Manage users and role assignments | Yes | No | No | No | No |
| Manage system configuration | Yes | No | No | No | No |
| View products | Yes | Yes | Yes | Read as needed | Read |
| Create/update/deactivate products | Yes | Yes | No | No | No |
| Manage warehouses and locations | Yes | Yes | Limited operational assignment only | No | Read |
| Record/confirm inbound receiving | Yes | Yes | Yes, if assigned | No | No |
| View inventory | Yes | Yes | Yes, operational scope | Read as needed | Read |
| Adjust inventory manually | Yes | Yes, subject to audit | No unless explicitly authorized | No | No |
| Create/manage outbound orders | Yes | Yes | Yes, if assigned | Read related records | No |
| Confirm dispatch / deduct stock | Yes | Yes | Yes, if assigned | No | No |
| Manage shipment records and statuses | Yes | Yes | No | Yes | Read |
| View operational reports | Yes | Yes | Limited | Shipment-related | Read |
| View audit history | Yes | Yes, if granted | No | No | Yes, read-only |

The matrix is a baseline proposal for the first version. Before coding,
the project owner must confirm whether employees can confirm receiving
and dispatch, whether managers can make manual adjustments, and which
reports and audit records each role can see. Until confirmed, keep those
specific permissions configurable or explicitly pending rather than
silently expanding access.

### 3.3 Authorization implementation rules

- Map application roles to stable backend authorities, for example
  `ROLE_ADMINISTRATOR` and `ROLE_WAREHOUSE_MANAGER`.
- Prefer permission/authority checks for sensitive actions when role
  checks alone become too broad.
- Validate record-level and warehouse-level access in the service layer
  whenever the approved data model requires it.
- A role does not automatically define which warehouse's data a user
  may access. Model warehouse assignments separately if multi-warehouse
  access restrictions are required.
- Record user/role changes and privileged operational actions in the
  audit history.
- Test every role against both allowed and denied operations.

## 4. Input validation and API safety

-   Validate request bodies, query parameters, IDs, dates, quantities,
    and status transitions.
-   Use DTOs rather than binding external input directly to JPA
    entities.
-   Reject invalid quantities and malformed identifiers.
-   Avoid mass assignment: expose only fields users are allowed to
    change.
-   Use parameterized database access through JPA or safe SQL
    parameters.
-   Apply pagination limits to list endpoints.
-   Return consistent error responses without stack traces or internal
    implementation details.
-   Configure CORS for known frontend origins only.
-   Apply CSRF protection appropriate to the selected authentication
    mechanism.
-   Use HTTPS in production.

## 5. Secrets and configuration

-   Keep passwords, signing keys, API keys, and production credentials
    outside source control.
-   Use environment variables or a secure secret manager.
-   Commit `.env.example` with placeholders only.
-   Add `.env`, private key files, and local secret files to
    `.gitignore`.
-   Rotate credentials if they are accidentally committed.
-   Never include secrets in application logs, error messages,
    screenshots, or audit metadata.

## 6. Inventory and operational integrity

-   Stock changes must be performed through authorized backend use
    cases.
-   Receiving, dispatch, transfer, and adjustment operations must be
    transactional.
-   Update inventory balance and movement history atomically.
-   Prevent negative stock unless explicitly approved.
-   Handle concurrent stock changes safely.
-   Validate status transitions for inbound, outbound, and shipment
    records.
-   Keep completed operational history traceable.
-   Test rollback when a movement insert or balance update fails.
-   Test concurrent dispatch attempts against the same available stock.

## 7. Audit and logging

Audit important business actions, including: - User and role changes. -
Receiving completion. - Dispatch completion. - Inventory adjustment or
transfer. - Shipment status updates. - Other privileged or sensitive
changes.

Audit records should identify the actor, action, target, and time. Store
before/after details only where needed and safe. Do not log passwords,
tokens, or unnecessary sensitive data.

Application logs should support troubleshooting without exposing
secrets. Use appropriate log levels and avoid logging full request
bodies indiscriminately.

## 8. Testing strategy

### 8.1 Unit tests

Use JUnit 5 and Mockito where appropriate to test: - Service business
rules. - Quantity and validation rules. - Allowed and forbidden status
transitions. - Permission checks. - Error conditions and edge cases.

### 8.2 Backend integration tests

Use Spring Boot Test and a real PostgreSQL test environment where
practical. Test: - Repository mappings and constraints. - REST endpoint
behavior. - Authentication and authorization. - Flyway migrations. -
Receiving and dispatch workflows. - Transaction rollback. - Inventory
concurrency behavior.

Testcontainers may be used if available and practical. Do not make the
test suite depend on an undocumented local database.

### 8.3 Frontend tests

Test important behavior such as: - Form validation and error display. -
Protected routes and role-aware navigation. - Loading, empty, and error
states. - API error handling. - Critical inbound, inventory, outbound,
and shipment user flows.

Use the test framework already present in the repository or select a
lightweight compatible setup with an explicit reason.

### 8.4 API and manual tests

Use Swagger UI, Postman, or Bruno to verify: - Valid requests. - Invalid
request bodies. - Missing/invalid authentication. - Insufficient
permissions. - Not-found resources. - Conflict responses such as
insufficient stock. - Pagination and filters. - Valid and invalid status
transitions.

Keep a repeatable set of test scenarios or collection where practical.

## 9. Required workflow test scenarios

At minimum, verify these end-to-end business scenarios:

1.  Authorized user creates a product.
2.  Unauthorized user cannot create or modify a product.
3.  Authorized user records an inbound operation.
4.  Confirming inbound increases the correct inventory balance.
5.  Confirming inbound also creates the corresponding movement record.
6.  Invalid inbound quantity is rejected.
7.  Authorized user creates an outbound operation.
8.  Dispatch with sufficient stock decreases the correct balance.
9.  Dispatch also creates the corresponding movement record.
10. Dispatch with insufficient stock is rejected without changing
    inventory.
11. Two concurrent dispatches cannot cause stock to become negative or
    be dispatched twice.
12. A failed operation rolls back both the balance and movement changes.
13. Invalid shipment status transitions are rejected.
14. Shipment status changes are recorded in history.
15. Users cannot access functions outside their permissions.
16. Audit records are created for configured sensitive operations.

Adapt scenarios to the final approved business workflows.

## 10. Definition of done

A task is complete only when: - Requirements and acceptance criteria are
met. - Backend authorization is in place for protected behavior. - Input
validation and error handling are implemented. - Database migrations are
included when schema changes are required. - Relevant automated tests
pass. - Frontend integration is verified when applicable. - No secrets
or sensitive information are committed or logged. - Documentation and
task tracking are updated. - The agent reports exactly which tests and
commands were run and any known limitations.

## 11. Agent reporting

For each implementation phase, report: - What was implemented. -
Important design decisions. - Files changed. - Database migrations added
or modified. - API endpoints/contracts changed. - Tests executed and
their actual results. - Security considerations. - Known issues and
unresolved decisions.

Do not report unexecuted tests as passing.
