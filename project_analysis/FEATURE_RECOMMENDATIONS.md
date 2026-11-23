# FEATURE_RECOMMENDATIONS.md

## LogiTrack — Feature Recommendations and Enhancement Analysis

**Document type:** Product feature recommendations
**Prepared by:** Senior Software Architect / Product Manager
**Date:** November 23, 2026
**Project:** Logistics Transit Warehouse Operation and Maintenance System (LogiTrack)

---

## How to Read This Document

Each recommendation includes:

- **Feature name** and **description**
- **Business problem solved** and **expected productivity improvement**
- **Intended users and roles**
- **Required changes** (frontend, backend, database, integrations)
- **Implementation complexity** (Low / Medium / High / Very High)
- **Priority classification** (P1 Production Critical / P2 High Value / P3 Competitive Differentiation / P4 Future Expansion)
- **Dependencies and risks**

Recommendations are divided into:
1. **New features** (net-new capabilities)
2. **Improvements to existing features** (enhancements to current functionality)
3. **Technical improvements** (infrastructure, security, performance — required for production readiness)

---

## PART 1: New Features

### P1 — Production Critical

#### F1. Secure Authentication — Refresh Tokens and Token Revocation

**Description:** Replace single-access-token JWT with access token + refresh token pattern. Access tokens short-lived (15 min), refresh tokens longer (7 days) stored HttpOnly. Implement token revocation on logout and password change.

**Business problem:** Current JWT in localStorage is vulnerable to XSS theft. Compromised tokens remain valid until expiry with no revocation path. No secure session management for production.

**Expected productivity improvement:** Reduces account takeover risk; enables automatic session renewal without user re-login.

**Intended users:** All authenticated users.

**Required changes:**
- **Backend:** Refresh token table (`refresh_tokens`), token rotation logic, revocation endpoint (`POST /auth/refresh`, `POST /auth/logout`), JwtService updates, SecurityConfig filter chain updates
- **Frontend:** Auth context updates to handle 401 → refresh → retry logic, HttpOnly cookie handling (or refresh token storage), logout revocation call
- **Database:** New `refresh_tokens` table (id, user_id, token_hash, expires_at, revoked_at, created_at)
- **Integrations:** None

**Complexity:** High

**Priority:** P1 — Production Critical

**Dependencies:** JWT service refactor, SecurityConfig

**Risks:** Refresh token theft (mitigated by rotation + HttpOnly), increased complexity in auth flow

---

#### F2. Database Indexes for Production Query Performance

**Description:** Add B-tree indexes on foreign key columns and commonly filtered/sorted columns across all tables.

**Business problem:** Without indexes, list endpoints will table-scan as data grows (thousands of orders, movements, audit logs). Dashboard and report queries will become slow.

**Expected productivity improvement:** Maintain sub-second list response times at 100k+ rows.

**Intended users:** All users (indirect, via faster page loads).

**Required changes:**
- **Database:** Flyway migration adding indexes:
  - `inventory_movements(occurred_at)`, `inventory_movements(product_id, occurred_at)`, `inventory_movements(reference_type, reference_id)`
  - `inbound_orders(created_at)`, `inbound_orders(status)`, `inbound_orders(warehouse_id)`
  - `outbound_orders(created_at)`, `outbound_orders(status)`, `outbound_orders(warehouse_id)`
  - `shipments(created_at)`, `shipments(status)`, `shipments(tracking_number)` (already unique)
  - `audit_logs(occurred_at)`, `audit_logs(entity_type, entity_id)`, `audit_logs(actor_user_id)`
  - `inventory_balances(product_id)`, `inventory_balances(storage_location_id)`
- **Backend:** None (indexes are transparent to JPA)
- **Frontend:** None

**Complexity:** Low

**Priority:** P1 — Production Critical

**Dependencies:** Flyway migration

**Risks:** Migration lock time on large tables (mitigate by running during low-traffic window)

---

#### F3. Account Lockout and Password Complexity Policy

**Description:** Implement account lockout after N failed login attempts (configurable, default 5), password complexity requirements (min length, mixed case, number, special char), and password history prevention.

**Business problem:** Current system allows unlimited login attempts and accepts any password. Vulnerable to credential stuffing and weak passwords.

**Expected productivity improvement:** Reduces account compromise incidents and support tickets for hacked accounts.

**Intended users:** All users (security benefit).

**Required changes:**
- **Backend:** `failed_login_attempts` column on users table, `locked_until` column, login attempt tracking, lockout check in AuthService, password validator bean, password history table
- **Frontend:** Password strength indicator on registration/change-password forms, lockout error message display
- **Database:** Users table columns, password_history table
- **Integrations:** None

**Complexity:** Medium

**Priority:** P1 — Production Critical

**Dependencies:** User entity, AuthService

**Risks:** Lockout of legitimate users (mitigate with unlock by admin or time-based expiry)

---

### P2 — High Value

#### F4. Stock Reservation / Allocation

**Description:** When an outbound order is created, reserve (lock) the requested quantity in inventory_balance as "reserved" until dispatch or cancellation. Prevent double-allocation of the same stock.

**Business problem:** Currently, stock is only checked at dispatch time. Two employees can create outbound orders for the same stock simultaneously; one will fail at dispatch, causing rework and customer dissatisfaction.

**Expected productivity improvement:** Eliminates dispatch failures due to stock contention; enables accurate available-to-promise calculations.

**Intended users:** Warehouse Manager, Warehouse Employee.

**Required changes:**
- **Backend:** `reserved_quantity` column on inventory_balances, reservation logic in OutboundService.create(), release on order cancellation, available_quantity = quantity_on_hand - reserved_quantity
- **Frontend:** Available quantity display in inventory balances, reservation status on outbound orders
- **Database:** Inventory balance schema change
- **Integrations:** None

**Complexity:** High

**Priority:** P2 — High Value

**Dependencies:** Inventory service, OutboundService

**Risks:** Reserved stock orphaned if order never dispatched/cancelled (mitigate with expiration or manual release)

---

#### F5. Low-Stock Alerts and Reorder Recommendations

**Description:** Configurable low-stock threshold per product. Alert when quantity_on_hand falls below threshold. Recommend reorder quantity based on historical movement velocity.

**Business problem:** Stockouts discovered only at dispatch time. No proactive replenishment planning.

**Expected productivity improvement:** Reduces stockouts; enables proactive purchasing; improves customer fulfillment rates.

**Intended users:** Warehouse Manager, Administrator.

**Required changes:**
- **Backend:** `low_stock_threshold` column on products, `low_stock_alerts` table or computed view, scheduled check (Spring `@Scheduled`), alert storage + retrieval endpoint (`GET /api/v1/inventory/alerts/low-stock`)
- **Frontend:** Low-stock dashboard card, alert list page, threshold configuration on product edit
- **Database:** Products table column, alerts table
- **Integrations:** None (in-app alerts; email integration is P3)

**Complexity:** Medium

**Priority:** P2 — High Value

**Dependencies:** Product entity, InventoryService

**Risks:** Alert fatigue if thresholds too low (mitigate with configurability)

---

#### F6. In-App Notification Center

**Description:** Persistent in-app notifications for inventory alerts, order status changes, @mentions, and system events. Unread count badge in topbar. Mark-as-read functionality.

**Business problem:** Users must poll pages to discover updates. No proactive awareness of stockouts, dispatch completions, or adjustments made by colleagues.

**Expected productivity improvement:** Reduces response time to operational events; improves team coordination.

**Intended users:** All authenticated users.

**Required changes:**
- **Backend:** `notifications` table (user_id, type, title, message, read_at, created_at, entity_type, entity_id), `POST /api/v1/notifications` (internal), `GET /api/v1/notifications` (list with pagination), `PATCH /notifications/{id}/read`, `GET /notifications/unread-count`
- **Frontend:** Notification bell with unread count (replace static badge), dropdown list, mark-all-read, toast on new notification
- **Database:** Notifications table
- **Integrations:** None

**Complexity:** Medium

**Priority:** P2 — High Value

**Dependencies:** None

**Risks:** Notification volume can overwhelm (mitigate with filtering, preferences)

---

#### F7. CSV / Excel Export for All List Pages

**Description:** Export filtered list results to CSV (or Excel) for products, inventory, inbound, outbound, shipments, movements, audit logs, users.

**Business problem:** Data is locked in the system. Warehouse managers cannot import into Excel for analysis, share with suppliers, or attach to emails.

**Expected productivity improvement:** Enables ad-hoc analysis, external sharing, and integration with legacy tools.

**Intended users:** Warehouse Manager, Administrator, Viewer/Auditor.

**Required changes:**
- **Backend:** Export service using Apache Commons CSV or similar, `GET /api/v1/{resource}/export?format=csv` endpoints with same filter params as list
- **Frontend:** Export button on each list page, download handling
- **Database:** None
- **Integrations:** None

**Complexity:** Low

**Priority:** P2 — High Value

**Dependencies:** Existing list endpoints

**Risks:** Large exports can timeout (mitigate with streaming response, row limits)

---

#### F8. Inventory Adjustment Reversal / Correction Workflow

**Description:** Ability to reverse or correct a previously posted inventory adjustment with a compensating movement, preserving audit trail.

**Business problem:** Employee enters wrong adjustment quantity. Currently must enter a second compensating adjustment manually. Error-prone and no link between original and correction.

**Expected productivity improvement:** Reduces correction errors; maintains clear audit trail of corrections.

**Intended users:** Administrator, Warehouse Manager.

**Required changes:**
- **Backend:** Correction movement linked to original via `reference_id` + `reference_type = ADJUSTMENT_CORRECTION`, validation that correction is authorized
- **Frontend:** "Correct" action on movement history row, correction modal with reason
- **Database:** None (existing reference_type/reference_id fields support this)
- **Integrations:** None

**Complexity:** Medium

**Priority:** P2 — High Value

**Dependencies:** Inventory movement entity, AuditLogService

**Risks:** Circular corrections (mitigate with validation)

---

### P3 — Competitive Differentiation

#### F9. Barcode / QR Code Scanning Integration

**Description:** Mobile web or native app support for scanning product barcodes during receiving, picking, and dispatch. Camera-based input via browser Web Camera API or native camera.

**Note:** This was listed as out of scope in PROJECT_DETAILS.md §8 but is a high-value differentiator for warehouse operations.

**Business problem:** Manual data entry of SKUs and quantities is slow and error-prone.

**Expected productivity improvement:** 3–5x faster receiving/picking; near-zero data entry errors.

**Intended users:** Warehouse Employee.

**Required changes:**
- **Backend:** Barcode lookup endpoint (`GET /api/v1/products/by-barcode/{barcode}`), barcode field on products table
- **Frontend:** Camera integration (HTML5 getUserMedia or library), scan mode on inventory/inbound/outbound pages
- **Database:** `barcode` column on products
- **Integrations:** Barcode label printer (P4)

**Complexity:** High

**Priority:** P3 — Competitive Differentiation

**Dependencies:** Product entity

**Risks:** Camera permissions, browser compatibility, lighting conditions

---

#### F10. Cycle Counting Workflow

**Description:** Scheduled or ad-hoc cycle counts by location. Compare system quantity to counted quantity. Generate adjustments for variances with approval workflow.

**Business problem:** Physical stock drifts from system stock over time (theft, damage, misplacement). No mechanism to detect and correct drift except annual full inventory.

**Expected productivity improvement:** Continuous inventory accuracy; reduces year-end write-offs.

**Intended users:** Warehouse Manager, Warehouse Employee, Administrator.

**Required changes:**
- **Backend:** `cycle_counts` table, `cycle_count_lines` table, count status (OPEN, COUNTED, VARIANCE, APPROVED), adjustment generation on approval
- **Frontend:** Cycle count list, count entry screen (scan or manual entry), variance review, approval
- **Database:** New tables
- **Integrations:** None

**Complexity:** High

**Priority:** P3 — Competitive Differentiation

**Dependencies:** Inventory balance, locations

**Risks:** Count disruption to operations (mitigate with scheduled counts)

---

#### F11. Shipment Tracking and Delivery Confirmation

**Description:** Carrier tracking number validation, estimated delivery date, delivery confirmation (POD) upload, exception flags (delayed, lost, damaged in transit).

**Business problem:** Shipments leave the warehouse but status is manually updated. No visibility into actual delivery or transit exceptions.

**Expected productivity improvement:** Proactive exception management; better customer communication.

**Intended users:** Shipment Manager, Warehouse Manager.

**Required changes:**
- **Backend:** `delivery_confirmed_at`, `pod_document_url`, `exception_reason` on shipments, carrier webhook ingestion endpoint (P4), tracking page
- **Frontend:** Delivery confirmation on shipment details, POD upload, exception reporting
- **Database:** Shipments table columns
- **Integrations:** Carrier API (FedEx/UPS/DHL) — P4

**Complexity:** Medium

**Priority:** P3 — Competitive Differentiation

**Dependencies:** Shipment entity

**Risks:** Carrier API costs, POD storage

---

#### F12. Scheduled and Custom Reports

**Description:** Beyond the dashboard, allow scheduled email reports (daily inventory snapshot, weekly shipment summary) and custom report builder (select columns, filters, date range).

**Business problem:** Managers need recurring reports but must manually log in and extract data.

**Expected productivity improvement:** Automates routine reporting; reduces manual data extraction.

**Intended users:** Warehouse Manager, Administrator, Viewer/Auditor.

**Required changes:**
- **Backend:** Report scheduler (`@Scheduled` or Quartz), email service (JavaMail), report definitions table, `GET /api/v1/reports/{id}` custom query builder
- **Frontend:** Report builder UI, schedule configuration, email recipient management
- **Database:** Report definitions, scheduled reports tables
- **Integrations:** SMTP email server

**Complexity:** High

**Priority:** P3 — Competitive Differentiation

**Dependencies:** ReportService, existing report data

**Risks:** Email deliverability, report query performance

---

### P4 — Future Expansion

#### F13. AI-Assisted Inventory Insights

**Description:** Demand forecasting, anomaly detection on movements, optimal reorder point recommendations, stock velocity analysis.

**Business problem:** Reactive inventory management. No predictive capability.

**Expected productivity improvement:** Reduced excess stock; fewer stockouts; better purchasing decisions.

**Intended users:** Warehouse Manager, Administrator.

**Required changes:**
- **Backend:** ML model integration (Python service or Java ML library), forecasting endpoint
- **Frontend:** Forecast charts, recommendation cards
- **Database:** Historical movement data (already exists)
- **Integrations:** ML serving infrastructure

**Complexity:** Very High

**Priority:** P4 — Future Expansion

**Dependencies:** 12+ months of historical data

**Risks:** Model accuracy, data quality requirements

---

#### F14. ERP / Accounting Integration

**Description:** Integration with QuickBooks, Xero, SAP, or custom ERP for financial synchronization of inventory valuations, purchase orders, and sales invoices.

**Business problem:** Warehouse data must be manually re-entered into accounting system.

**Expected productivity improvement:** Eliminates double data entry; consistent financial records.

**Intended users:** Administrator, Finance (external).

**Required changes:**
- **Backend:** Integration adapters, OAuth2 client credentials, webhook handlers, field mapping UI
- **Frontend:** Connection wizard, field mapping, sync status
- **Database:** Integration credentials table (encrypted), sync log table
- **Integrations:** External ERP APIs

**Complexity:** Very High

**Priority:** P4 — Future Expansion

**Dependencies:** None

**Risks:** API changes, data consistency, security of credentials

---

#### F15. Mobile Native Application

**Description:** React Native or Flutter app for warehouse floor use: barcode scanning, offline operation, push notifications.

**Business problem:** Warehouse employees don't have desktop access at the pick face.

**Expected productivity improvement:** Enables floor-level operations without returning to desktop.

**Intended users:** Warehouse Employee, Shipment Manager.

**Required changes:**
- **Frontend:** Separate mobile app codebase, API contracts same as web
- **Backend:** None (same API)
- **Database:** None
- **Integrations:** Push notification service (FCM/APNs)

**Complexity:** Very High

**Priority:** P4 — Future Expansion

**Dependencies:** F9 (barcode scanning), F6 (notifications)

**Risks:** App store approval, device management, offline sync complexity

---

## PART 2: Improvements to Existing Features

### E1. Inventory — Bulk Operations and Batch Confirmation

**Current:** Inbound orders must be confirmed one at a time. No bulk selection.

**Improvement:** Add multi-select on inbound/outbound list pages with bulk confirm/dispatch action. Background job for large batches.

**Complexity:** Medium

**Priority:** P2

**Roles:** Warehouse Manager, Warehouse Employee

### E2. Inventory — Stock Reservation Visibility

**Current:** Inventory balance shows `quantity_on_hand` only. No distinction between available and reserved.

**Improvement:** Add `available_quantity` column (on_hand - reserved) to balance DTO. Show reserved quantity in tooltip.

**Complexity:** Low (depends on F4)

**Priority:** P2

**Roles:** Warehouse Manager, Warehouse Employee

### E3. Shipments — Split Shipment Support

**Current:** One shipment per outbound order (unique constraint on `outbound_order_id`).

**Improvement:** Remove unique constraint; allow multiple shipments per outbound order for partial deliveries to different addresses.

**Complexity:** Medium

**Priority:** P3

**Roles:** Shipment Manager

**Note:** Requires business decision (currently out of scope per PROJECT_DETAILS.md)

### E4. Reports — Trend Charts and Comparisons

**Current:** Static KPI cards and simple bar comparison.

**Improvement:** Add 30/90-day trend lines for inbound/outbound volume, inventory turnover rate, order cycle time.

**Complexity:** Medium

**Priority:** P2

**Roles:** Warehouse Manager, Administrator

### E5. Audit Logs — Export and Suspicious Activity Detection

**Current:** Read-only list with filters.

**Improvement:** CSV export, flag unusual patterns (after-hours adjustments, bulk deletions, failed login spikes).

**Complexity:** Medium

**Priority:** P2

**Roles:** Administrator, Viewer/Auditor

### E6. Dashboard — Warehouse-Specific Views

**Current:** Single-warehouse dashboard aggregates all data.

**Improvement:** Warehouse selector for multi-warehouse visibility (when multi-warehouse access control is implemented).

**Complexity:** Low

**Priority:** P2

**Roles:** Warehouse Manager, Administrator

### E7. Frontend — Toast Notification System

**Current:** Inline error messages only. No success confirmations for mutations.

**Improvement:** Toast notifications for create/update/delete success and errors. Auto-dismiss.

**Complexity:** Low

**Priority:** P2

**Roles:** All users

### E8. Frontend — Form Draft Persistence

**Current:** Form data lost on navigation away.

**Improvement:** Auto-save form drafts to localStorage; restore on return.

**Complexity:** Low

**Priority:** P3

**Roles:** All users

### E9. Backend — Request Correlation IDs

**Current:** No correlation ID in logs or error responses.

**Improvement:** Generate `X-Request-ID` on each request; include in error responses and logs.

**Complexity:** Low

**Priority:** P1 (production debugging)

**Roles:** Operations (indirect)

### E10. Backend — Structured JSON Logging

**Current:** Default Spring Boot logging (text format).

**Improvement:** JSON log format for log aggregation (ELK/EFK).

**Complexity:** Low

**Priority:** P1 (production observability)

**Roles:** Operations (indirect)

---

## PART 3: Technical Improvements (Production Readiness)

### T1. JWT Security — HttpOnly Cookies + Refresh Tokens

**See F1.** Critical security remediation.

**Complexity:** High | **Priority:** P1

### T2. Database Indexes

**See F2.** Critical performance remediation.

**Complexity:** Low | **Priority:** P1

### T3. Rate Limiting — Distributed (Redis) or API Gateway

**Current:** In-memory, per-instance.

**Improvement:** Move to Redis-backed rate limiter or API gateway (Kong, nginx, Cloudflare) for distributed enforcement.

**Complexity:** Medium

**Priority:** P1

**Roles:** Operations

### T4. Account Lockout and Password Policy

**See F3.**

**Complexity:** Medium | **Priority:** P1

### T5. Security Headers

**Description:** Add Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Referrer-Policy.

**Complexity:** Low | **Priority:** P1

**Roles:** All users (security benefit)

### T6. Backup and Recovery Strategy

**Description:** Document and test PostgreSQL backup (pg_dump cron, WAL archiving, point-in-time recovery). Test restore procedure.

**Complexity:** Medium | **Priority:** P1

**Roles:** Operations

### T7. CI/CD Pipeline

**Description:** GitHub Actions or GitLab CI: build, test, lint, security scan, container build, deploy to staging.

**Complexity:** Medium | **Priority:** P2

**Roles:** Operations

### T8. Health Checks and Monitoring

**Description:** Backend `/actuator/health` with DB connectivity check. Prometheus metrics endpoint. Uptime monitoring.

**Complexity:** Low | **Priority:** P2

**Roles:** Operations

### T9. Structured Logging + Correlation IDs

**See E9, E10.**

**Complexity:** Low | **Priority:** P1

**Roles:** Operations

### T10. Multi-Warehouse Access Control

**Description:** Warehouse assignment to users. Backend filters data by user's assigned warehouse(s). Schema already has `warehouse_id` on orders; enforcement missing.

**Complexity:** High

**Priority:** P2

**Roles:** Administrator (setup), all users (runtime filtering)

**Note:** Requires business decision on warehouse assignment model

---

## Summary Table: All Recommendations by Priority

| ID | Feature | Complexity | Priority | Depends On |
|----|---------|-----------|----------|------------|
| T1 | JWT security (refresh + revocation) | High | P1 | JwtService, SecurityConfig |
| T2 | Database indexes | Low | P1 | Flyway migration |
| T3 | Distributed rate limiting | Medium | P1 | Redis or API gateway |
| T4 | Account lockout + password policy | Medium | P1 | User entity, AuthService |
| T5 | Security headers | Low | P1 | SecurityConfig |
| T6 | Backup and recovery | Medium | P1 | DBA, pg_dump |
| T9 | Structured logging + correlation IDs | Low | P1 | Logback config |
| F4 | Stock reservation | High | P2 | Inventory, OutboundService |
| F5 | Low-stock alerts | Medium | P2 | Product entity |
| F6 | Notification center | Medium | P2 | Notifications table |
| F7 | CSV/Excel export | Low | P2 | Existing list endpoints |
| F8 | Adjustment reversal | Medium | P2 | Inventory movement |
| E1 | Bulk confirm/dispatch | Medium | P2 | Inbound/Outbound |
| E2 | Available quantity visibility | Low | P2 | F4 dependency |
| E4 | Trend charts | Medium | P2 | Reports |
| E7 | Toast notifications | Low | P2 | Frontend |
| T7 | CI/CD pipeline | Medium | P2 | GitHub Actions |
| T8 | Health checks + monitoring | Low | P2 | Actuator, Prometheus |
| T10 | Multi-warehouse access control | High | P2 | User-warehouse mapping |
| F9 | Barcode scanning | High | P3 | Product entity |
| F10 | Cycle counting | High | P3 | Inventory |
| F11 | Shipment tracking + POD | Medium | P3 | Shipment entity |
| F12 | Scheduled + custom reports | High | P3 | ReportService, SMTP |
| E3 | Split shipments | Medium | P3 | Shipment entity |
| E5 | Audit export + suspicious detection | Medium | P3 | Audit logs |
| E6 | Warehouse-specific dashboard | Low | P3 | Dashboard |
| E8 | Form draft persistence | Low | P3 | Frontend |
| F13 | AI inventory insights | Very High | P4 | 12+ months data |
| F14 | ERP integration | Very High | P4 | External APIs |
| F15 | Mobile app | Very High | P4 | F9, F6 |

---
