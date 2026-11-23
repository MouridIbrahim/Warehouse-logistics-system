# IMPLEMENTATION_ROADMAP.md

## LogiTrack — Implementation Roadmap

**Document type:** Implementation roadmap
**Project:** Logistics Transit Warehouse Operation and Maintenance System (LogiTrack)
**Date:** November 23, 2026

---

## How to Read This Roadmap

The roadmap is organized into four phases. Each phase includes objectives, features/improvements, dependencies, implementation order, expected outcomes, and acceptance criteria.

**Assumptions:**
- One full-time backend engineer and one full-time frontend engineer
- 2-week sprints
- PostgreSQL running in Docker for development and staging
- Production deployment on a single server or small cluster

---

## Phase 1: Critical Production Improvements (Weeks 1–6)

**Objective:** Make LogiTrack secure, performant, and operationally safe for production deployment. Fix all production blockers identified in the audit.

### Features and Improvements

| ID | Feature | Type | Complexity | Owner |
|----|---------|------|-----------|-------|
| T1 | JWT security: HttpOnly cookies + refresh tokens + revocation | Technical | High | Backend + Frontend |
| T2 | Database indexes on FK, date, and status columns | Technical | Low | Backend (Flyway) |
| T3 | Distributed rate limiting (Redis or API gateway) | Technical | Medium | Backend + Infra |
| T4 | Account lockout + password complexity policy | Technical | Medium | Backend + Frontend |
| T5 | Security headers (CSP, HSTS, X-Content-Type-Options, etc.) | Technical | Low | Backend |
| T6 | Database backup strategy and tested restore | Technical | Medium | Infra / DBA |
| T9 | Structured JSON logging + correlation IDs | Technical | Low | Backend |

### Dependencies

- Flyway migration for `refresh_tokens` table (T1)
- Flyway migration for index additions (T2)
- Redis instance or API gateway (T3)
- SMTP configuration for password reset (T4, partial)

### Implementation Order

1. **Week 1:** T2 (indexes) + T5 (security headers) — low risk, immediate impact
2. **Week 1–2:** T1 (refresh tokens + HttpOnly cookies) — highest security impact
3. **Week 2–3:** T4 (account lockout + password policy) — security hardening
4. **Week 3:** T9 (structured logging + correlation IDs) — observability foundation
5. **Week 4:** T6 (backup strategy + tested restore) — data safety
6. **Week 5–6:** T3 (distributed rate limiting) — infrastructure work
7. **Week 6:** Security regression testing + penetration test

### Expected Outcomes

- All 7 production blockers resolved
- JWT tokens securely stored and revocable
- Database queries performant at 100k+ rows
- Rate limiting survives restarts and scales across instances
- Account lockout prevents credential stuffing
- Automated database backups with tested restore
- Structured logs ready for log aggregation

### Acceptance Criteria

- [ ] Penetration test passes (no critical/high findings)
- [ ] Database queries < 200ms p95 at 100k rows
- [ ] Backup restore tested successfully
- [ ] Rate limiting works across 2+ backend instances
- [ ] All 30 backend tests + 9 frontend tests pass
- [ ] Security headers present in all responses

---

## Phase 2: High-Value Operational Improvements (Weeks 7–14)

**Objective:** Significantly improve daily warehouse productivity and reduce operational errors.

### Features and Improvements

| ID | Feature | Type | Complexity | Owner |
|----|---------|------|-----------|-------|
| F4 | Stock reservation / available-to-promise | New | High | Backend + Frontend |
| F5 | Low-stock alerts and reorder recommendations | New | Medium | Backend + Frontend |
| F6 | In-app notification center | New | Medium | Backend + Frontend |
| F7 | CSV/Excel export for all list pages | New | Low | Backend + Frontend |
| F8 | Inventory adjustment reversal/correction | New | Medium | Backend + Frontend |
| E1 | Bulk confirm/dispatch for inbound/outbound | Improvement | Medium | Frontend + Backend |
| E2 | Available quantity visibility | Improvement | Low | Frontend (depends on F4) |
| E4 | Trend charts in reports | Improvement | Medium | Frontend + Backend |
| E7 | Toast notification system | Improvement | Low | Frontend |
| T7 | CI/CD pipeline | Technical | Medium | Infra |
| T8 | Health checks and monitoring | Technical | Low | Infra |

### Dependencies

- F4 must complete before E2
- SMTP server for email alerts (F5) — or in-app only for MVP
- Notification UI component library (F6)

### Implementation Order

1. **Week 7–8:** F4 (stock reservation) — foundational for inventory accuracy
2. **Week 8–9:** E1 (bulk operations) + E7 (toasts) — quick productivity wins
3. **Week 9–10:** F5 (low-stock alerts) + F7 (CSV export) — operational visibility
4. **Week 10–11:** F6 (notification center) — team coordination
5. **Week 11–12:** F8 (adjustment reversal) + E4 (trend charts) — error recovery + analytics
6. **Week 12–13:** E2 (available quantity) — depends on F4
7. **Week 13–14:** T7 (CI/CD) + T8 (health checks + monitoring) — operational maturity

### Expected Outcomes

- Zero double-allocation dispatch failures
- Proactive stock replenishment (low-stock alerts before stockout)
- Teams notified of operational events without polling
- Data exportable for external analysis
- Faster operations (bulk confirm/dispatch)
- Automated build/test/deploy pipeline
- Production observability (health checks, metrics)

### Acceptance Criteria

- [ ] No double-allocation bugs in 30-day trial
- [ ] Low-stock alert triggers correctly at configurable threshold
- [ ] CSV export works for all 9 list pages
- [ ] CI/CD pipeline deploys to staging on every merge
- [ ] Health check endpoint returns 200 with DB connectivity
- [ ] All existing tests continue to pass

---

## Phase 3: Advanced and Differentiating Features (Weeks 15–26)

**Objective:** Differentiate LogiTrack from basic WMS competitors with intelligent and mobile capabilities.

### Features and Improvements

| ID | Feature | Type | Complexity | Owner |
|----|---------|------|-----------|-------|
| F9 | Barcode/QR code scanning | New | High | Backend + Frontend |
| F10 | Cycle counting workflow | New | High | Backend + Frontend |
| F11 | Shipment tracking + POD upload | New | Medium | Backend + Frontend |
| F12 | Scheduled + custom reports | New | High | Backend + Frontend |
| E3 | Split shipment support | Improvement | Medium | Backend + Frontend |
| E5 | Audit export + suspicious activity | Improvement | Medium | Backend + Frontend |
| E6 | Warehouse-specific dashboard | Improvement | Low | Frontend |
| E8 | Form draft persistence | Improvement | Low | Frontend |

### Dependencies

- F9 requires product `barcode` field (database change)
- F11 requires carrier integration decision (use tracking number manual entry for MVP)
- F12 requires SMTP email service

### Implementation Order

1. **Week 15–17:** F9 (barcode scanning) — product barcode field + scan UI
2. **Week 17–19:** F10 (cycle counting) — count entry + variance approval
3. **Week 19–21:** F11 (shipment tracking + POD) — delivery confirmation
4. **Week 21–23:** F12 (scheduled/custom reports) — report builder + scheduler
5. **Week 23–24:** E3 (split shipments) — multi-shipment per order
6. **Week 24–25:** E5 (audit export + suspicious detection) — compliance
7. **Week 25–26:** E6 (warehouse dashboard) + E8 (form drafts) — polish

### Expected Outcomes

- Floor-level scanning reduces data entry errors
- Cycle counts maintain inventory accuracy
- Delivery confirmations and POD improve customer service
- Custom reports reduce manual data extraction
- Split shipments support partial deliveries

### Acceptance Criteria

- [ ] Barcode scan adds product to inbound/outbound in < 3 seconds
- [ ] Cycle count variance generates adjustment movement
- [ ] POD upload and display on shipment details
- [ ] Scheduled report delivered via email
- [ ] Split shipment creates multiple shipment records per order

---

## Phase 4: Long-Term Expansion (Months 7–12+)

**Objective:** Expand LogiTrack into a comprehensive logistics platform with intelligent features and integrations.

### Features and Improvements

| ID | Feature | Type | Complexity | Owner |
|----|---------|------|-----------|-------|
| F13 | AI-assisted inventory insights | New | Very High | Backend + Data |
| F14 | ERP/Accounting integration | New | Very High | Backend |
| F15 | Mobile native application | New | Very High | Frontend (mobile) |

### Dependencies

- F13 requires 12+ months of historical movement data
- F14 requires ERP API access and credential management
- F15 requires F9 (barcode) and F6 (notifications) as prerequisites

### Implementation Order

1. **Month 7–8:** F14 (ERP integration) — start with one ERP (QuickBooks/Xero)
2. **Month 8–10:** F13 (AI insights) — after sufficient historical data
3. **Month 10–12:** F15 (mobile app) — after barcode + notifications stable

### Expected Outcomes

- Financial synchronization eliminates double data entry
- Predictive inventory reduces stockouts and excess stock
- Mobile app enables floor-level operations without desktop

### Acceptance Criteria

- [ ] ERP sync completes without errors for 30 days
- [ ] AI forecast accuracy within acceptable tolerance (define with stakeholder)
- [ ] Mobile app passes app store review and works offline

---

## Phase Summary

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|-----------------|
| Phase 1 | Weeks 1–6 | Production readiness | Security, indexes, backups, logging |
| Phase 2 | Weeks 7–14 | Operational productivity | Reservations, alerts, notifications, export |
| Phase 3 | Weeks 15–26 | Differentiation | Barcode, cycle counting, tracking, reports |
| Phase 4 | Months 7–12+ | Platform expansion | ERP integration, AI insights, mobile |

---

## Top 10 Most Valuable Improvements

| Rank | Feature | Phase | Reason |
|------|---------|-------|--------|
| 1 | JWT security (refresh + revocation) | Phase 1 | Eliminates session hijacking risk |
| 2 | Database indexes | Phase 1 | Prevents performance degradation |
| 3 | Stock reservation | Phase 2 | Eliminates dispatch failures |
| 4 | Low-stock alerts | Phase 2 | Prevents stockouts proactively |
| 5 | Notification center | Phase 2 | Improves team coordination |
| 6 | CSV/Excel export | Phase 2 | Enables external analysis |
| 7 | Account lockout + password policy | Phase 1 | Prevents credential stuffing |
| 8 | Barcode scanning | Phase 3 | 3–5x faster operations |
| 9 | Cycle counting | Phase 3 | Maintains inventory accuracy |
| 10 | Backup strategy | Phase 1 | Prevents data loss |

---

## Top 5 Differentiating Features

| Rank | Feature | Phase | Differentiation |
|------|---------|-------|-----------------|
| 1 | Barcode/QR scanning | Phase 3 | Floor-level speed most WMS web apps lack |
| 2 | Cycle counting | Phase 3 | Continuous accuracy vs annual full count |
| 3 | AI inventory insights | Phase 4 | Predictive vs reactive management |
| 4 | Shipment POD + tracking | Phase 3 | Delivery confirmation most basic WMS lack |
| 5 | ERP integration | Phase 4 | Eliminates double data entry with accounting |

---

## Top 5 Biggest Risks Before Production

| Rank | Risk | Phase | Mitigation |
|------|------|-------|------------|
| 1 | JWT in localStorage (XSS theft) | Phase 1 | Move to HttpOnly cookies + refresh tokens |
| 2 | No database indexes | Phase 1 | Add Flyway migration before production load |
| 3 | No backup strategy | Phase 1 | Implement pg_dump cron + test restore |
| 4 | No account lockout | Phase 1 | Add lockout after 5 failed attempts |
| 5 | No distributed rate limiting | Phase 1 | Redis-backed or gateway rate limiting |

---

## Features NOT Recommended Yet

| Feature | Reason |
|---------|--------|
| F14 ERP integration (Very High complexity) | Requires dedicated integration team; wait until Phase 4 when platform is stable |
| F15 Mobile app (Very High complexity) | Requires separate codebase, app store management, offline sync; build web PWA first |
| F13 AI insights (Very High complexity) | Needs 12+ months of data; premature without historical volume |
| Partial receiving/dispatch | Explicitly out of scope per PROJECT_DETAILS.md §9; adds significant complexity |
| Supplier/customer management | Explicitly out of scope per PROJECT_DETAILS.md §8; expands scope beyond WMS |
| Stock transfers between warehouses | Explicitly out of scope; single warehouse confirmed for v1 |
| Microservices architecture | Explicitly out of scope; monolith is appropriate for current scale |

---

## Recommended Implementation Order (First 8 Weeks)

| Week | Primary Focus | Key Deliverable |
|------|-------------|-----------------|
| 1 | Database + Security foundations | Indexes, security headers, backup strategy |
| 2 | Authentication hardening | Refresh tokens, HttpOnly cookies, revocation |
| 3 | Access control | Account lockout, password policy |
| 4 | Observability | Structured logging, correlation IDs |
| 5 | Data safety | Tested backup restore |
| 6 | Distributed infra | Redis rate limiting, security regression testing |
| 7 | Inventory accuracy | Stock reservation |
| 8 | Productivity | Bulk operations, toast notifications |

---
