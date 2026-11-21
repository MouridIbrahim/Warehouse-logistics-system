# Database Design and PostgreSQL Guide

## 1. Purpose

This document defines database design principles for the Logistics
Transit Warehouse Operation and Maintenance System.

The database is **PostgreSQL**, running in Docker during development.
Spring Boot connects to it through the Docker Compose network when the
backend also runs in Docker.

This document describes the proposed data model and integrity rules. It
is not permission to invent unresolved business behavior. Confirm the
open decisions in `PROJECT_DETAILS.md` before finalizing schema details.

## 2. Technology and ownership

-   Database: PostgreSQL.
-   Backend persistence: Spring Data JPA / Hibernate.
-   Schema migrations: Flyway.
-   PostgreSQL container: managed by Docker Compose.
-   Persistent storage: Docker named volume.
-   PostgreSQL is the source of truth for persisted business records.
-   Schema changes must be version-controlled as Flyway migration
    scripts.

Do not use Hibernate `ddl-auto=update` as the production
schema-management strategy. Prefer `ddl-auto=validate` after Flyway has
applied migrations.

## 3. Connection model

### Backend running inside Docker

Use the Compose service name, for example:

``` text
jdbc:postgresql://db:5432/logistics_db
```

`db` is the PostgreSQL service name in `docker-compose.yml`. Docker's
internal DNS resolves it for other containers on the Compose network.

### Backend running locally outside Docker

If PostgreSQL port 5432 is published to the host:

``` text
jdbc:postgresql://localhost:5432/logistics_db
```

Do not use `localhost` from the backend container to reach the
PostgreSQL container.

### Data persistence

Use a named Docker volume mounted at PostgreSQL's data directory.
Removing/recreating the container must not remove the database data. Do
not run destructive volume removal commands against a database
containing data that must be retained.

## 4. Proposed logical entities

The following is a starting domain model. Final table names, attributes,
nullability, and relationships must be reviewed against approved
requirements.

### 4.1 Identity and access

**users** - id - username or email (unique according to the approved
login rule) - password_hash - display_name - active - created_at -
updated_at

**roles** - id - name (unique) - description

Seed the initial role catalogue using these stable role codes:
`ADMINISTRATOR`, `WAREHOUSE_MANAGER`, `WAREHOUSE_EMPLOYEE`,
`SHIPMENT_MANAGER`, and `VIEWER_AUDITOR`. These must correspond to the
five roles described in `PROJECT_DETAILS.md` and the permission matrix
in `SECURITY_AND_TESTING.md`. Use Flyway seed/migration scripts so role
records are reproducible across environments. Avoid creating duplicate
role rows when migrations are rerun.

**permissions** - id - code (unique) - description. Use this table when
implementing fine-grained authorities for individual capabilities.
Permission codes should be stable and descriptive, such as
`PRODUCT_READ`, `PRODUCT_MANAGE`, `INBOUND_CONFIRM`,
`INVENTORY_VIEW`, `INVENTORY_ADJUST`, `OUTBOUND_DISPATCH`,
`SHIPMENT_UPDATE`, `USER_MANAGE`, and `AUDIT_READ`. Final codes should
match the implemented API/service authorization rules.

**user_roles** - user_id - role_id - composite unique/primary key.
The initial design permits a user to have one or more roles; confirm
whether the application should enforce exactly one role per user. If
exactly one is selected, enforce it consistently in application logic
and database constraints.

**role_permissions** - role_id - permission_id - composite
unique/primary key. Use this join table to map each role to its allowed
permissions when fine-grained permissions are used.

Do not store plaintext passwords. The role catalogue and initial
authorization policy are defined in `PROJECT_DETAILS.md` and
`SECURITY_AND_TESTING.md`; keep migrations, backend authorities, and
frontend role-aware behavior consistent with those documents.

### 4.2 Product and warehouse structure

**products** - id - sku (unique) - name - description (optional) -
unit_of_measure (if required) - active - created_at - updated_at

**warehouses** - id - code (unique) - name - address or description (as
required) - active - created_at - updated_at

**storage_locations** - id - warehouse_id (FK) - code - name or label -
parent_location_id (optional, only if hierarchical locations are
approved) - active

Add a unique constraint for location code within the appropriate
warehouse scope. Do not assume a multi-level location hierarchy until
confirmed.

### 4.3 Inbound operations

**inbound_orders** - id - reference_number (unique) - warehouse_id (FK,
if applicable) - status - received_at or operation date - created_by (FK
to users) - notes (optional) - created_at - updated_at

**inbound_order_items** - id - inbound_order_id (FK) - product_id (FK) -
storage_location_id (FK, if location is captured at receiving) -
expected_quantity (optional, only if expected quantities are part of the
workflow) - received_quantity - unit_of_measure snapshot only if
required for historical accuracy

The system must distinguish a draft/expected record from a confirmed
receipt if those are separate workflow stages.

### 4.4 Outbound operations

**outbound_orders** - id - reference_number (unique) - warehouse_id (FK,
if applicable) - status - requested_at - created_by (FK to users) -
notes (optional) - created_at - updated_at

**outbound_order_items** - id - outbound_order_id (FK) - product_id
(FK) - storage_location_id (FK, if stock is picked from a specific
location) - requested_quantity - dispatched_quantity (only if partial
dispatch is approved)

Do not assume reservation, approval, or partial-dispatch behavior until
confirmed.

### 4.5 Inventory

**inventory_balances** (or `inventory`) - id - product_id (FK) -
storage_location_id (FK) - quantity_on_hand - version (optional, for
optimistic locking) - updated_at

If stock is tracked by warehouse without individual locations, adjust
the unique key and model accordingly. If location-level tracking is
approved, enforce uniqueness for `(product_id, storage_location_id)` and
prevent invalid negative balances.

**inventory_movements** - id - product_id (FK) - storage_location_id
(FK, nullable only for approved movement types) - movement_type -
quantity_delta (signed quantity, or quantity plus direction; choose one
consistent representation) - reference_type - reference_id -
performed_by (FK to users) - occurred_at - notes (optional)

Movement records are the audit trail of stock changes. Prefer
append-only behavior: do not edit or delete historical movements during
normal operations. Corrections should be represented by a new authorized
adjustment movement.

### 4.6 Shipments

**shipments** - id - tracking_number or shipment_reference -
outbound_order_id (FK, if shipment belongs to an outbound order) -
carrier_name (optional) - status - shipped_at (optional) - delivered_at
(optional) - created_at - updated_at

**shipment_status_history** - id - shipment_id (FK) - previous_status
(nullable for initial status) - new_status - changed_by (FK to users) -
changed_at - note (optional)

Use a controlled status set and validate transitions in the backend.

### 4.7 Audit history

**audit_logs** - id - actor_user_id (FK, nullable only for explicitly
supported system events) - action - entity_type - entity_id -
occurred_at - metadata (structured JSON only when useful and safe)

Do not place passwords, tokens, secrets, or unnecessary sensitive data
in audit metadata.

## 5. Relationship overview

Proposed relationships:

-   User many-to-many Role through `user_roles`.
-   Role many-to-many Permission through `role_permissions` if
    fine-grained permissions are used.
-   Warehouse one-to-many StorageLocation.
-   Warehouse one-to-many InboundOrder and OutboundOrder if orders are
    warehouse-scoped.
-   InboundOrder one-to-many InboundOrderItem.
-   OutboundOrder one-to-many OutboundOrderItem.
-   Product one-to-many InboundOrderItem and OutboundOrderItem.
-   Product one-to-many InventoryBalance.
-   StorageLocation one-to-many InventoryBalance.
-   Product one-to-many InventoryMovement.
-   StorageLocation one-to-many InventoryMovement where location
    applies.
-   OutboundOrder one-to-many Shipments only if split shipments are
    allowed; otherwise enforce the approved cardinality.
-   Shipment one-to-many ShipmentStatusHistory.
-   User one-to-many operational records as creator/actor where
    appropriate.

Agents must verify cardinalities against confirmed workflows before
writing final migrations.

## 6. Data integrity rules

### Primary and foreign keys

-   Every table must have a stable primary key.
-   Use foreign keys for relationships.
-   Choose a consistent ID strategy (for example UUID or generated
    numeric IDs) and use it consistently.
-   Do not rely only on frontend checks for referential integrity.

### Unique constraints

Potential unique values include: - User login identifier. - Product
SKU. - Warehouse code. - Location code within its warehouse. -
Inbound/outbound reference numbers. - Shipment tracking/reference number
when provided.

Confirm whether identifiers are globally unique or unique only within a
warehouse/tenant.

### Quantity and numeric constraints

-   Quantities must use an appropriate numeric type and precision.
-   Reject invalid negative input where not meaningful.
-   Use database checks where suitable.
-   Avoid floating-point types for inventory quantities.
-   Define whether fractional quantities are allowed and what precision
    is required.

### Deletion and history

-   Prefer active/inactive or archived states for products, users,
    locations, and other records referenced by history.
-   Use restrictive foreign-key behavior for important operational
    history.
-   Do not cascade-delete inventory movements, completed orders,
    shipment history, or audit logs as a convenience.

### Timestamps

-   Use a consistent timestamp strategy, preferably timezone-aware
    timestamps for event times.
-   Store event timestamps consistently (commonly UTC) and format them
    for users in the frontend.
-   Distinguish business dates from event timestamps where necessary.

## 7. Inventory consistency and concurrency

Inventory is a critical part of the application.

1.  The balance row represents the current quantity for its defined
    product/location key.
2.  Movement records explain why the balance changed.
3.  Every stock-changing operation updates the balance and inserts the
    movement record in the same database transaction.
4.  If any part fails, the whole transaction must roll back.
5.  Prevent negative balances using both backend logic and appropriate
    database safeguards.
6.  Prevent lost updates and double allocation under concurrent
    requests.
7.  Choose and document a concurrency strategy:
    -   Pessimistic row locking; or
    -   Optimistic locking with a version column and conflict handling;
        or
    -   A safe atomic conditional update.
8.  Do not assume that a stock value read earlier by the frontend is
    still current.
9.  Define how stock reservations, available quantity, damaged stock,
    and transfers work only after business rules are confirmed.
10. Test simultaneous dispatch attempts against limited stock.

The inventory movement table should be treated as append-only for normal
application workflows. Reconciliation or correction should use explicit,
authorized adjustment records.

## 8. Indexing guidance

Add indexes based on actual query patterns. Likely candidates: - Unique
indexes for SKU, login identifier, and reference numbers. - Foreign-key
columns used for joins. - Inventory balance lookup by product and
location. - Inventory movement by product and occurred_at. -
Inbound/outbound order status and created/operation date. - Shipment
tracking number and status. - Audit log timestamp and entity reference.

Avoid indexing every column. Review query plans and actual data volume
before adding unnecessary indexes.

## 9. Flyway migration rules

Store migrations in:

``` text
backend/src/main/resources/db/migration/
```

Use Flyway versioned migration names such as:

``` text
V1__create_identity_tables.sql
V2__create_products_and_warehouses.sql
V3__create_inbound_and_outbound_tables.sql
V4__create_inventory_tables.sql
V5__create_shipments_and_audit_tables.sql
```

These names are illustrative. The agent must create migrations in
dependency order based on the final approved schema.

Rules: - Never edit a migration that has already been applied to a
shared or persistent database; create a new migration. - Test migrations
against a clean database. - Test upgrades from the previous schema when
practical. - Keep schema changes and relevant seed-data changes
reviewable. - Do not use Flyway and Hibernate schema auto-update as
competing schema owners. - Keep development seed data separate from
production credentials and production data.

## 10. Seed data

Development seed data may include: - A small set of sample products. - A
sample warehouse and storage locations if the chosen model uses them. -
Sample inbound/outbound records and inventory for demonstrations. -
Roles and permissions required for the application.

Do not commit a real administrator password. Provide a safe setup
process for creating the initial administrator, or use a clearly
documented development-only seed credential that must be changed and is
never enabled in production.

## 11. Backup and operational safety

-   Use a persistent Docker volume for local development data.
-   Document backup and restore commands for PostgreSQL.
-   Do not expose the database port publicly in production.
-   Use strong credentials and restrict network access.
-   Do not delete Docker volumes during routine rebuilds.
-   Production deployment must have a tested backup/restore process.

## 12. Open database decisions

Do not finalize schema choices that depend on unresolved business
rules: - Single versus multiple warehouses. - Supplier/customer
entities. - Partial receiving and partial dispatch. - Approval
workflow. - Location hierarchy. - Damaged/expired/returned/quarantined
stock. - Stock transfers. - Reservation model. - Shipment-to-order
cardinality. - Fractional quantities and units of measure. - Whether
audit metadata requires a formal change-detail table.

Record the decision and its impact before implementing the relevant
migration.

## 13. Database implementation checklist

-   [ ] Confirm domain decisions with `PROJECT_DETAILS.md`.
-   [ ] Agree entity names and relationships with backend architecture.
-   [ ] Define ID and naming conventions.
-   [ ] Define quantity units and precision.
-   [ ] Design keys, foreign keys, unique constraints, and checks.
-   [ ] Design inventory balance and movement consistency.
-   [ ] Add Flyway migrations in dependency order.
-   [ ] Validate schema with Hibernate `ddl-auto: validate`.
-   [ ] Test clean database initialization.
-   [ ] Test migration upgrade path.
-   [ ] Test transaction rollback and concurrent stock changes.
-   [ ] Document backup and restore.
