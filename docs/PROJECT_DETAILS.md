# Logistics Transit Warehouse Operation and Maintenance System

## 1. Purpose

Build a web-based Logistics Transit Warehouse Operation and Maintenance
System that helps an organization record, monitor, and manage goods
moving through warehouse operations. The system should provide reliable
records for receiving, storage, inventory, outbound processing, shipment
tracking, users, reports, and important operational changes.

This document is the product-level source of truth. It defines **what
the system should do**. The frontend, backend, database, and
security/testing documents define how to implement it.

## 2. Project goals

-   Digitize warehouse inbound and outbound operations.
-   Maintain an accurate view of stock by product and storage location.
-   Track the lifecycle of inbound and outbound operations.
-   Record shipment details and shipment progress.
-   Provide role-appropriate access to operational functions.
-   Make important actions traceable through audit and inventory
    movement records.
-   Provide useful dashboards, search, filters, and reports.
-   Keep the implementation understandable and suitable for an academic
    software engineering project.

## 3. Agreed technical direction

  Area                               Technology / decision
  ---------------------------------- -----------------------------
  Frontend                           React, TypeScript, Vite
  Backend                            Java 25, Spring Boot 4
  Architecture                       Modular monolith
  Database                           PostgreSQL
  Persistence                        Spring Data JPA / Hibernate
  Database migrations                Flyway
  Build                              Maven
  API documentation                  OpenAPI / Swagger UI
  Containers                         Docker and Docker Compose
  Development frontend               Runs locally outside Docker
  Development backend and database   Run in Docker

Do not replace this stack or introduce microservices, Kubernetes, Redis,
or other infrastructure without an explicit project requirement and
approval.

## 4. Scope and functional modules

### 4.1 Authentication and user administration

-   Allow authorized users to sign in and sign out.
-   Support user administration, activation/deactivation, and role
    assignment.
-   Enforce permissions on the backend, not only by hiding frontend
    controls.
-   Provide administrator-oriented user management.

### 4.2 Roles and permissions

The initial system role model contains these five roles. Use these names
consistently across the frontend, backend, database seed data, API
authorization, and documentation unless the project owner approves a
change.

1. **Administrator**
   - Manages user accounts, activation/deactivation, role assignments,
     and system-level configuration.
   - Has access to all operational modules and administrative functions.
   - Can review audit history.

2. **Warehouse Manager**
   - Oversees warehouse operations, products, warehouse/location records,
     inbound receiving, inventory, outbound processing, and operational
     reports.
   - Can monitor warehouse activity and review relevant operational
     history.
   - Approval workflows are not implied; add approval actions only if
     separately confirmed.

3. **Warehouse Employee**
   - Performs day-to-day tasks explicitly granted to operational staff,
     such as recording receipts, assigning storage locations, picking
     goods, and processing dispatches.
   - Can view the operational records needed to perform those tasks.
   - Cannot manage users, assign roles, or change system configuration.

4. **Shipment Manager**
   - Creates and maintains shipment records and tracking information.
   - Updates shipment statuses through valid backend-enforced
     transitions.
   - Views related outbound-order information needed to manage shipments.
   - Does not independently change inventory balances.

5. **Viewer / Auditor**
   - Has read-only access to the records, reports, and audit history
     granted by the system.
   - Cannot create, update, delete, receive, dispatch, or adjust
     operational records.

The detailed permission matrix is defined in
`SECURITY_AND_TESTING.md`. These five roles are the baseline role
catalogue for the project; the exact permissions and any warehouse-level
data restrictions must be reviewed before implementation. Do not create
additional roles or silently grant broader permissions without approval.

### 4.3 Goods / product management

-   Create, view, update, search, and deactivate product records.
-   Store an identifiable SKU or product code, name, description, and
    any required unit/category fields.
-   Validate unique product identifiers.
-   Do not delete products that are referenced by historical operations;
    prefer deactivation or archival.

### 4.4 Warehouse and storage locations

-   Represent warehouses and their storage locations.
-   Allow authorized users to create and maintain location records.
-   Support locating stock by product and location.
-   Whether the first version supports one warehouse or multiple
    warehouses is a pending decision.

### 4.5 Inbound receiving

-   Record goods arriving at a warehouse.
-   Record the products and quantities received, relevant dates,
    reference numbers, and responsible users.
-   Validate received quantities and required product/location
    references.
-   On confirmation of a receiving operation, increase available
    inventory and create corresponding inventory movement records in the
    same database transaction.
-   Draft, submitted, approved, and completed states should only be
    implemented if the final workflow requires them.

### 4.6 Inventory monitoring

-   Display current quantities by product and storage location.
-   Provide search, filtering, and pagination for inventory records.
-   Keep a traceable movement history for stock increases, decreases,
    and transfers.
-   Do not allow negative stock unless an explicitly approved business
    rule says otherwise.
-   Inventory balances and movement history must remain consistent.

### 4.7 Outbound processing

-   Record outbound requests/orders and their item quantities.
-   Validate that sufficient stock is available before dispatch.
-   Prevent two concurrent operations from allocating or dispatching the
    same stock.
-   Reduce inventory and create movement records atomically when the
    business workflow confirms dispatch.
-   Support partial dispatch only if approved as a business rule.

### 4.8 Shipment tracking

-   Store shipment references and relevant shipment details.
-   Associate shipments with outbound operations where applicable.
-   Track status changes and timestamps.
-   Proposed status examples: pending, prepared, in transit, delivered,
    delayed, cancelled. Confirm the final state machine before
    implementation.
-   Keep status history where it is needed for traceability.

### 4.9 Dashboard and reports

-   Provide operational summaries such as inbound volume, outbound
    volume, current inventory, pending operations, and shipment status
    counts.
-   Provide date-range and other useful filters.
-   Ensure report figures are derived from persisted records and have
    clearly defined meanings.
-   Avoid presenting mock values as real operational data.

### 4.10 Audit history

-   Record important actions such as user/role changes, receiving
    confirmation, dispatch, inventory adjustments, and shipment status
    updates.
-   Capture actor, action, target record, timestamp, and relevant change
    metadata where appropriate.
-   Do not store passwords, tokens, or other secrets in audit metadata.

## 5. Core business principles

1.  PostgreSQL is the authoritative source of persisted business data.
2.  Every confirmed stock change must be traceable to an operation or
    authorized adjustment.
3.  Inventory balance changes and their movement-history entries must
    commit or roll back together.
4.  A user must not perform an operation without the required
    server-side permission.
5.  Historical operational records should not be silently deleted or
    rewritten.
6.  Validate all input on the backend even when the frontend also
    validates it.
7.  Use pagination for potentially large list endpoints.
8.  Use consistent status transitions; do not allow arbitrary status
    changes.
9.  Use database constraints and transactions in addition to application
    validation.
10. Do not invent unresolved business rules. Record them as pending
    decisions and ask the project owner before implementing behavior
    that depends on them.

## 6. Main workflows

### 6.1 Receiving workflow (baseline concept)

1.  An authorized user creates an inbound record.
2.  The user adds one or more product lines and quantities.
3.  The system validates product, quantity, warehouse, and location
    information.
4.  An authorized user confirms/completes the receiving operation
    according to the approved workflow.
5.  The system increases inventory and writes inventory movement records
    in one transaction.
6.  The operation becomes visible in history and relevant reports.

### 6.2 Dispatch workflow (baseline concept)

1.  An authorized user creates an outbound record and adds product
    lines.
2.  The system checks available stock.
3.  The operation is validated and confirmed according to the approved
    workflow.
4.  The system safely decreases inventory and records the corresponding
    movements in one transaction.
5.  The outbound record and shipment information can be tracked.

### 6.3 Shipment status workflow

1.  An authorized user opens a shipment record.
2.  The user selects a valid next status.
3.  The backend validates the transition and records who changed it and
    when.
4.  The updated status appears in shipment views and reports.

These are workflow outlines. Agents must inspect the approved project
rules and preserve any more specific requirements supplied by the
project owner.

## 7. Suggested domain concepts

Likely concepts include: - User, Role, Permission - Product - Warehouse,
StorageLocation - InboundOrder, InboundOrderItem - OutboundOrder,
OutboundOrderItem - InventoryBalance (or Inventory) -
InventoryMovement - Shipment, ShipmentStatusHistory - AuditLog

The exact entity/table design belongs in `DATABASE.md`. Do not create
duplicate concepts under different names without a clear reason.

## 8. Explicitly out of scope unless later approved

-   Full ERP or accounting system.
-   Real payment processing.
-   Full fleet management or route optimization.
-   Customs clearance workflows.
-   Integration with every carrier or third-party logistics provider.
-   Microservices infrastructure or Kubernetes.
-   Native mobile application.
-   Customer-facing public tracking portal.
-   Barcode/QR scanning and label printing.
-   Advanced forecasting or AI-based demand prediction.
-   Multiple-branch warehouse support if not selected for the first
    version.

## 9. Decisions that must be confirmed

The following decisions were confirmed by the project owner before the
first implementation phase. They are recorded here as the authoritative
answers.

1.  Single warehouse or multiple warehouses? → **Single warehouse** for
    v1. The schema remains warehouse-scoped so additional warehouses can
    be added later without rework.
2.  Are suppliers and customers managed as first-class records? → **No**.
    Out of scope for v1.
3.  Can inbound receiving be partial? → **No**. An inbound order is
    received in full in one confirmation.
4.  Can outbound dispatch be partial? → **No**. An outbound order
    dispatches its full requested quantity in one transaction.
5.  Is manager approval required before receiving completion or
    dispatch? → **No**. No approval workflow in v1.
6.  What is the exact warehouse/location hierarchy? → **Flat**: warehouse
    → storage location (no zones/aisles/racks/shelves/bins).
7.  How are damaged, expired, returned, or quarantined goods handled? →
    **Out of scope** for v1. Corrections use an authorized inventory
    adjustment movement.
8.  Are stock transfers between locations/warehouses required? → **No**.
    Movement types are limited to inbound, outbound, and adjustment.
9.  What exact shipment statuses and allowed transitions are required? →
    **PENDING, PREPARED, IN_TRANSIT, DELIVERED, DELAYED, CANCELLED.**
    Allowed transitions: PENDING→PREPARED|CANCELLED;
    PREPARED→IN_TRANSIT|CANCELLED; IN_TRANSIT→DELIVERED|DELAYED;
    DELAYED→IN_TRANSIT|DELIVERED|CANCELLED. DELIVERED and CANCELLED are
    terminal.
10. Which reports are mandatory for the course demonstration? →
    Inbound volume, outbound volume, current inventory summary, pending
    operations, and shipment status counts.

Additional technical decisions confirmed at the same time: Java 25 +
Spring Boot 4 (4.0.10), JWT bearer-token authentication, numeric
generated primary keys, and whole-number quantities only.

Agents must not silently choose further answers. Any new unresolved rule
must be proposed in a clearly labelled proposal and kept pending until
approved.

## 10. Non-functional expectations

-   Clear separation of frontend, backend, and persistence
    responsibilities.
-   Maintainable modular-monolith structure.
-   Secure authentication and authorization.
-   Consistent validation and error responses.
-   Transactional inventory operations.
-   Responsive, accessible user interface.
-   Useful logging without leaking secrets or sensitive data.
-   Automated tests for important business rules.
-   Reproducible local setup using documented commands.
-   Database schema changes managed through Flyway.

## 11. Agent instructions

Before implementing a feature: 1. Read all five documents in `docs/`. 2.
Inspect the existing repository and identify what already exists. 3.
Compare the requested feature with the current implementation. 4. Do not
overwrite working code or invent requirements. 5. Identify dependencies
and API contracts between frontend and backend. 6. Implement in small,
reviewable steps and run relevant tests. 7. Update documentation when an
approved design or contract changes. 8. Report assumptions, changed
files, commands run, test results, and unresolved issues.

## 12. Definition of a project-complete feature

A feature is not complete merely because its screen or endpoint exists.
It should include: - Approved behavior and validation. - Appropriate
authorization. - Persistence and migration where required. - Correct
error handling. - Frontend/backend integration where applicable. - Tests
for important success and failure cases. - Updated documentation and a
concise implementation summary.
