# Logistics Warehouse Management System
# Complete UI/UX Design Specification for Google Stitch

**Document purpose:** This is the single UI/UX source of truth for generating the complete first-version web application design in Google Stitch.

**Product:** Logistics Transit Warehouse Operation and Maintenance System  
**Interface:** Web application  
**Frontend target:** React + TypeScript + Vite  
**Design mode:** Light mode only  
**Visual direction:** Industrial Orange — Modern Enterprise SaaS  
**Typography:** Inter  
**Target users:** Administrator, Warehouse Manager, Warehouse Employee, Shipment Manager, Viewer / Auditor

---

## 1. Product and design goals

Design a professional warehouse and logistics operations platform used by staff who work with products, warehouses, stock, inbound receipts, outbound dispatches, shipments, reports, and user access.

The interface must feel:

- Professional and operational, not playful or consumer-oriented.
- Clear and information-dense without feeling crowded.
- Consistent across all modules.
- Fast to scan, especially for tables, stock quantities, order statuses, and alerts.
- Safe for important operations: receiving, dispatching, stock adjustments, and cancellations.
- Accessible, with readable contrast and clear focus states.
- Responsive, with desktop as the primary experience and tablet/mobile adaptations.

Do not create a marketing website. Design the authenticated application and its operational screens.

## 2. Locked design decisions

These decisions are confirmed and should not be changed by individual screen designs.

### 2.1 Brand palette

| Token | Hex | Intended use |
|---|---|---|
| `--color-primary` | `#C45D16` | Main brand action, primary buttons, selected controls |
| `--color-primary-hover` | `#A94B0D` | Hover/pressed state for primary actions |
| `--color-accent` | `#F28C28` | Small highlights, icon accents, illustrations; use sparingly |
| `--color-sidebar` | `#242B35` | Main sidebar background |
| `--color-sidebar-text` | `#E2E8F0` | Sidebar labels and icons |
| `--color-sidebar-muted` | `#94A3B8` | Secondary sidebar labels |
| `--color-sidebar-active` | `#C45D16` | Active navigation item |
| `--color-background` | `#F6F7F9` | Main application canvas |
| `--color-surface` | `#FFFFFF` | Cards, tables, forms, dialogs |
| `--color-text-primary` | `#18212F` | Main headings and body text |
| `--color-text-secondary` | `#64748B` | Supporting text, descriptions, metadata |
| `--color-border` | `#E2E8F0` | Borders, separators, table row dividers |
| `--color-success` | `#15803D` | Completed, active, successful |
| `--color-warning` | `#B45309` | Pending, waiting, attention required |
| `--color-info` | `#2563EB` | Processing, informational state |
| `--color-danger` | `#DC2626` | Failed, rejected, destructive warning |

Semantic status badges should use pale tinted backgrounds with dark readable text:
- Success background: `#DCFCE7`; text: `#166534`.
- Warning background: `#FEF3C7`; text: `#92400E`.
- Info background: `#DBEAFE`; text: `#1D4ED8`.
- Danger background: `#FEE2E2`; text: `#991B1B`.
- Neutral background: `#F1F5F9`; text: `#475569`.

**Color rules**
- Orange is the brand/action color, not the color for every status.
- Use charcoal primarily for navigation, not large content backgrounds.
- Keep most content surfaces white or very light grey.
- Do not use neon colors, heavy gradients, glassmorphism, or large decorative color blocks.
- Do not rely on color alone to communicate status; include text and, where useful, an icon.

### 2.2 Typography

Use **Inter** throughout the entire application. Do not mix font families.

| Use | Size | Weight |
|---|---:|---:|
| Page title | 28px | 700 |
| Section heading | 20px | 600 |
| Card heading | 16px | 600 |
| Body | 14px | 400 |
| Table content | 13–14px | 400 |
| Form label | 13px | 500 |
| Button | 14px | 600 |
| Helper text / metadata | 12px | 400–500 |
| KPI number | 28–32px | 700 |

Use tabular numerals for quantities, prices, IDs, and dates where alignment matters (`font-variant-numeric: tabular-nums`).

### 2.3 Layout and spacing

- Desktop-first content layout.
- Fixed/collapsible left sidebar: approximately 250px expanded, 76px collapsed.
- Top bar: approximately 64px high.
- Main content: flexible width with 24–32px desktop page padding.
- Use a consistent 4px spacing scale: 4, 8, 12, 16, 20, 24, 32, 40.
- Main cards: 12px radius, white surface, subtle 1px border.
- Inputs and buttons: 8px radius.
- Dialogs: 14–16px radius.
- Avoid excessive shadows. Prefer borders and subtle elevation.
- Use a 12-column responsive grid where useful.
- Keep tables aligned and readable; avoid squeezing too many columns into narrow screens.

### 2.4 Iconography

Use Lucide-style outline icons consistently.
- Typical icon size: 18–20px.
- Sidebar icons: 18px.
- Button icons: 16–18px.
- Use one icon style and consistent stroke weight.
- Do not use emoji as interface icons.

---

## 3. Global application shell

All authenticated pages (screens 3–29) share the same application shell.

### 3.1 Sidebar

Dark charcoal `#242B35`, with:
- Product mark and application name at the top.
- Navigation grouped into clear sections.
- Icon + text label for each item.
- Orange active item background/indicator.
- Expand/collapse control.
- User profile area at the bottom.
- Optional environment label only if useful; do not invent one.

Navigation groups and entries:

**OVERVIEW**
- Dashboard

**CATALOG & STORAGE**
- Products
- Warehouses
- Inventory

**OPERATIONS**
- Inbound Operations
- Outbound Operations
- Shipments

**INSIGHTS**
- Reports & Analytics
- Audit Logs

**ADMINISTRATION**
- User Management
- Roles & Permissions (may be a tab/section within user administration if a separate route is not needed)
- System Settings

**ACCOUNT**
- My Profile

Navigation items must be filtered by the current user's permissions. Do not display inaccessible actions as if they were available.

### 3.2 Top bar

- Breadcrumbs or current page title.
- Optional global search if it can search meaningful entities.
- Notifications icon with unread indicator.
- Help/support entry only if a real destination exists.
- User avatar/name and dropdown (profile, sign out).
- Keep the top bar white with a subtle bottom border.

### 3.3 Page header pattern

Each page should use:
- Breadcrumb (when page is nested).
- Clear page title.
- One-sentence description where useful.
- Primary action on the right when the user has permission.
- Secondary actions grouped beside the primary action.
- Filters below the header for list pages.

### 3.4 Standard list-page pattern

Use this for products, warehouses, orders, shipments, users, and audit logs:
1. Page header and primary action.
2. Optional KPI summary strip only when useful.
3. Search field.
4. Relevant filters (status, warehouse, category, date range, etc.).
5. Data table with clear column headings.
6. Pagination and rows-per-page control.
7. Row action menu.
8. Loading, empty, error, and no-results states.

### 3.5 Standard detail-page pattern

Use:
- Entity name and identifier.
- Status badge.
- Primary permitted action(s).
- Summary cards or key-value information.
- Tabs or clearly separated sections for details, items, activity/history.
- Audit/activity information where relevant.
- Confirmation dialog for irreversible actions.

---

## 4. Shared component library

Create these as reusable components in the design language. Do not reinvent them for each screen.

### 4.1 Navigation and structure
- `AppSidebar`
- `SidebarNavGroup`
- `SidebarNavItem`
- `AppTopbar`
- `Breadcrumbs`
- `PageHeader`
- `PageContainer`
- `SectionHeader`
- `TabNavigation`

### 4.2 Data display
- `StatCard` / `KpiCard`
- `DataTable`
- `TableToolbar`
- `TablePagination`
- `StatusBadge`
- `PriorityBadge`
- `Avatar`
- `UserCell`
- `EmptyState`
- `LoadingSkeleton`
- `ErrorState`
- `ActivityTimeline`
- `KeyValueList`
- `ProgressBar`
- `QuantityDisplay`

### 4.3 Forms and inputs
- `TextInput`
- `SearchInput`
- `SelectInput`
- `MultiSelect`
- `DatePicker`
- `DateRangePicker`
- `NumberInput`
- `Textarea`
- `Checkbox`
- `RadioGroup`
- `FormField`
- `FormSection`
- `FileUpload`
- `BarcodeInput` (only if barcode entry is supported)
- `InlineValidationMessage`

### 4.4 Actions and feedback
- `PrimaryButton`
- `SecondaryButton`
- `TertiaryButton`
- `IconButton`
- `DropdownMenu`
- `ConfirmationDialog`
- `SideDrawer`
- `ModalDialog`
- `ToastNotification`
- `AlertBanner`
- `Tooltip`

### 4.5 Operational components
- `OrderItemsTable`
- `InventoryQuantityBreakdown`
- `StockMovementTable`
- `WarehouseLocationPicker`
- `ReceivingQuantityInput`
- `PickingChecklist`
- `ShipmentStatusStepper`
- `OperationSummary`
- `FilterChips`

### 4.6 Component behavior and states

Every interactive component should show:
- Default state.
- Hover state.
- Keyboard focus state.
- Disabled state.
- Loading state when an operation is in progress.
- Validation/error state when relevant.

Forms should display labels above controls, helper text below when needed, and errors adjacent to the affected field. Never rely only on placeholder text for field labels.

---

## 5. Role-aware interface rules

The system has five proposed roles. The UI must reflect backend permissions; hiding a button is not a substitute for backend authorization.

1. **Administrator** — user and role administration, system configuration, broad operational visibility.
2. **Warehouse Manager** — oversees warehouse operations, products, stock, inbound/outbound workflows, and reports.
3. **Warehouse Employee** — performs permitted receiving, storage, picking, and dispatch tasks.
4. **Shipment Manager** — manages shipment records, tracking information, and delivery statuses.
5. **Viewer / Auditor** — read-only access to permitted operational records, reports, and audit information.

Rules:
- Show only navigation sections and actions permitted to the signed-in user.
- Read-only users must not see create, edit, delete, receive, or dispatch actions.
- Warehouse Employee actions may be limited to operational tasks; do not grant administrative controls.
- Shipment Manager should have shipment-management actions, not general inventory-editing privileges.
- Administrator-only screens must not appear for other roles unless the permission model explicitly grants access.
- Do not invent approval workflows or warehouse-level restrictions. Treat them as pending business rules until confirmed.
- If a user lacks access to a route, show a clear access-denied page or redirect according to the product's routing rules.

The permission matrix in the project requirements is authoritative. If a screen design conflicts with backend permissions, follow the permission specification rather than the visual mockup.

---

# 6. Complete screen inventory — 29 screens

The following is the agreed first-version screen inventory. A screen may have create/edit/detail modes or drawers where noted; do not inflate the page count by designing separate pages for every small modal.

## Group A — Authentication (2 screens)

### Screen 01 — Login

**Purpose:** Authenticate a staff member.

**Layout**
- Centered login panel on a light grey background.
- Compact application logo/name.
- Page heading: “Welcome back”.
- Short supporting sentence.
- Email/username field.
- Password field with show/hide control.
- Remember-me checkbox only if supported by the authentication design.
- Forgot password link.
- Full-width orange Sign In button.
- Loading and invalid-credentials states.

**Components**
- `AuthLayout`, `TextInput`, `PasswordInput`, `Checkbox`, `PrimaryButton`, `InlineValidationMessage`.

**Behavior**
- Validate required fields.
- Keep error messages concise and near the relevant field.
- Do not reveal whether an unknown email exists.
- Do not show registration unless self-registration is explicitly supported.

### Screen 02 — Forgot Password

**Purpose:** Request password recovery.

**Layout**
- Same authentication visual style.
- Back-to-login link.
- Email field.
- Orange “Send reset instructions” button.
- Success confirmation state that does not disclose account existence.

**Components**
- `AuthLayout`, `TextInput`, `PrimaryButton`, `AlertBanner`.

---

## Group B — Dashboard (1 screen)

### Screen 03 — Main Dashboard

**Purpose:** Give each role a useful operational overview.

**Layout**
- Shared app shell.
- Page heading “Dashboard” and contextual welcome.
- KPI cards:
  - Total products.
  - Total warehouses.
  - Inventory/stock overview.
  - Pending inbound orders.
  - Pending outbound orders.
  - Active shipments.
- Main chart area: inventory or operation trend, based on available data.
- Recent operational activity.
- Attention/low-stock alerts where supported.
- Quick actions based on permissions.

**Components**
- `PageHeader`, `StatCard`, `ChartCard`, `ActivityTimeline`, `AlertBanner`, `QuickActionCard`.

**Behavior**
- KPI cards link to relevant filtered pages when useful.
- Dashboard data and quick actions adapt to role permissions.
- Do not display fabricated chart values as real production data; use clearly labeled sample data in mockups.
- Include skeleton, empty, and error states.

---

## Group C — Product Management (2 screens)

### Screen 04 — Products List

**Purpose:** Search and manage the product catalogue.

**Layout**
- Page header “Products” with “Add Product” action for authorized users.
- Search by product name, SKU, or barcode.
- Filters: category, status, and other confirmed product attributes.
- Table columns:
  - Product / product name.
  - SKU.
  - Category.
  - Unit of measure (if defined).
  - Stock summary (only if the source data supports it).
  - Status.
  - Updated date.
  - Actions.
- Pagination.

**Components**
- `PageHeader`, `TableToolbar`, `DataTable`, `StatusBadge`, `TablePagination`, `DropdownMenu`.

### Screen 05 — Product Details / Create / Edit

**Purpose:** View or maintain one product. Use a consistent detail route with create/edit modes, or a full-page form if needed.

**Detail mode**
- Product name, SKU, category, status.
- Description and product attributes.
- Unit of measure only if the domain supports it.
- Stock summary by warehouse only if available.
- Related movement/history preview if supported.

**Create/edit mode**
- Product name.
- SKU.
- Category.
- Description.
- Image upload only if product images are in scope.
- Other fields only when confirmed by the backend/domain model.
- Save and Cancel actions.

**Components**
- `PageHeader`, `FormSection`, `TextInput`, `SelectInput`, `Textarea`, `FileUpload`, `KeyValueList`, `PrimaryButton`.

**Behavior**
- Show field validation and duplicate SKU feedback.
- Confirm before destructive deactivation/deletion.
- Do not invent mandatory fields or product attributes.

---

## Group D — Warehouse Management (3 screens)

### Screen 06 — Warehouses List

**Purpose:** View and manage warehouses.

**Layout**
- Header “Warehouses” and authorized “Add Warehouse” action.
- Search and status filters.
- Table columns:
  - Warehouse name.
  - Warehouse code.
  - Location/address summary.
  - Capacity/occupancy only if modeled.
  - Number of storage locations only if available.
  - Status.
  - Actions.

**Components**
- `PageHeader`, `TableToolbar`, `DataTable`, `StatusBadge`, `TablePagination`.

### Screen 07 — Warehouse Details

**Purpose:** Inspect one warehouse and its operational summary.

**Layout**
- Warehouse name, code, status.
- Location and contact details if available.
- Summary cards: products/SKUs, stock quantity, locations, utilization only if supported.
- Tabs: Overview, Storage Locations, Inventory, Activity (only for supported data).
- Recent operations/activity.

**Components**
- `PageHeader`, `StatCard`, `TabNavigation`, `KeyValueList`, `DataTable`, `ActivityTimeline`.

### Screen 08 — Storage Locations Management

**Purpose:** Browse and manage locations within a warehouse.

**Layout**
- Warehouse selector or breadcrumb.
- Search by location code.
- Filters by location type/status only if those attributes exist.
- Table or structured hierarchy showing location code, warehouse, type, capacity/occupancy if supported, and status.
- Authorized “Add Location” action.
- Create/edit location drawer or modal.

**Components**
- `PageHeader`, `SelectInput`, `SearchInput`, `DataTable`, `SideDrawer`, `FormField`, `StatusBadge`.

**Important**
- Do not assume a particular hierarchy such as zone → aisle → rack → shelf → bin unless confirmed in the domain model.
- Do not invent capacity rules.

---

## Group E — Inventory Management (3 screens)

### Screen 09 — Inventory Overview

**Purpose:** See current stock across warehouses.

**Layout**
- Header “Inventory”.
- Summary cards: total SKUs, total units, low-stock items, reserved stock if supported.
- Search by product/SKU.
- Filters: warehouse, category, stock status.
- Table columns:
  - Product.
  - SKU.
  - Warehouse.
  - Storage location if available.
  - On-hand quantity.
  - Reserved quantity if supported.
  - Available quantity if supported.
  - Stock status.
- Export action only if export is implemented.

**Components**
- `StatCard`, `TableToolbar`, `DataTable`, `QuantityDisplay`, `StatusBadge`, `FilterChips`.

### Screen 10 — Stock Details

**Purpose:** Inspect stock for a selected product and warehouse/location.

**Layout**
- Product and warehouse identity.
- Prominent quantity breakdown:
  - On-hand.
  - Reserved, if supported.
  - Available, if supported.
  - Damaged/quarantined, only if supported.
- Stock movement summary.
- Location allocation table where supported.
- Stock adjustment action only for authorized roles and only if adjustments are part of the confirmed workflow.

**Components**
- `PageHeader`, `InventoryQuantityBreakdown`, `StatCard`, `DataTable`, `AlertBanner`, `ConfirmationDialog`.

**Behavior**
- Make quantities easy to compare.
- Clearly distinguish current balance from historical movements.
- Never imply that a displayed value is editable if it is calculated by the backend.

### Screen 11 — Stock Movement History

**Purpose:** Trace inventory changes.

**Layout**
- Search by SKU/product/reference.
- Filters: warehouse, movement type, date range, user.
- Table columns:
  - Date/time.
  - Product/SKU.
  - Warehouse/location.
  - Movement type.
  - Quantity change (+/-).
  - Reference (inbound/outbound/adjustment).
  - Performed by.
- Movement detail drawer with before/after values if recorded.

**Components**
- `TableToolbar`, `DateRangePicker`, `DataTable`, `ActivityTimeline`, `SideDrawer`, `QuantityDisplay`.

**Behavior**
- History is read-only.
- Make inbound and outbound references clickable when the corresponding records are accessible.

---

## Group F — Inbound Operations (4 screens)

### Screen 12 — Inbound Orders List

**Purpose:** Track expected and received goods.

**Layout**
- Header “Inbound Operations” and “Create Inbound Order” action if permitted.
- KPI strip: awaiting receipt, partially received if supported, completed.
- Search by inbound reference or supplier if supplier is in scope.
- Filters: status, warehouse, date range.
- Table columns:
  - Inbound reference.
  - Supplier/source if modeled.
  - Destination warehouse.
  - Expected date.
  - Item count.
  - Status.
  - Actions.

**Components**
- `StatCard`, `TableToolbar`, `DataTable`, `StatusBadge`, `TablePagination`.

### Screen 13 — Create Inbound Order

**Purpose:** Register an expected inbound delivery.

**Layout**
- Step-free, clearly grouped form unless the workflow becomes genuinely complex.
- General information: reference (generated or entered according to backend rules), destination warehouse, supplier/source only if supported, expected date, notes.
- Items editor:
  - Product selector.
  - Expected quantity.
  - Unit only if supported.
  - Add/remove item rows.
- Summary of item count and quantities.
- Save Draft / Create actions only if these states are supported.

**Components**
- `FormSection`, `SelectInput`, `DatePicker`, `OrderItemsTable`, `NumberInput`, `Textarea`, `PrimaryButton`.

**Behavior**
- Prevent invalid or zero/negative quantities.
- Show duplicate product rows clearly; follow the backend's aggregation rules.
- Do not invent suppliers or purchase-order integration if not in scope.

### Screen 14 — Inbound Order Details

**Purpose:** Review an inbound order and its progress.

**Layout**
- Reference, status, warehouse, supplier/source if supported, expected date.
- Item table: product, expected quantity, received quantity, remaining quantity.
- Receipt history/activity timeline if partial receiving is supported.
- Primary “Receive Goods” action for permitted users and eligible statuses.
- Cancel action only if supported, with confirmation.

**Components**
- `PageHeader`, `StatusBadge`, `OrderItemsTable`, `ActivityTimeline`, `SideDrawer`, `ConfirmationDialog`.

### Screen 15 — Receive Goods

**Purpose:** Record physically received quantities.

**Layout**
- Inbound order summary at top.
- Product-by-product receiving table:
  - Product/SKU.
  - Expected quantity.
  - Previously received quantity if applicable.
  - Quantity received now.
  - Difference/discrepancy indicator.
  - Storage location selector if supported.
  - Notes for discrepancy if required.
- Receipt summary and final confirmation.
- Prominent orange “Confirm Receipt” action.

**Components**
- `ReceivingQuantityInput`, `WarehouseLocationPicker`, `OrderItemsTable`, `Textarea`, `OperationSummary`, `ConfirmationDialog`.

**Critical UX**
- Show exactly what will be added to stock before confirmation.
- Make over-receipt/under-receipt feedback clear.
- Support partial receipt only if the business rules and backend support it.
- Confirmation should clearly state that inventory will be updated.
- Do not make stock balance directly editable on this screen.

---

## Group G — Outbound Operations (4 screens)

### Screen 16 — Outbound Orders List

**Purpose:** Track orders requiring picking and dispatch.

**Layout**
- Header “Outbound Operations” and “Create Outbound Order” action if permitted.
- KPI strip: awaiting processing, picking, ready for dispatch, dispatched (based on actual statuses).
- Search by outbound reference/customer if customer is in scope.
- Filters: status, source warehouse, date range.
- Table columns:
  - Outbound reference.
  - Customer/destination if modeled.
  - Source warehouse.
  - Created date.
  - Item count.
  - Status.
  - Actions.

**Components**
- `StatCard`, `TableToolbar`, `DataTable`, `StatusBadge`, `TablePagination`.

### Screen 17 — Create Outbound Order

**Purpose:** Create a request to send goods out of a warehouse.

**Layout**
- General information: source warehouse, customer/destination only if modeled, requested date, notes.
- Item editor: product, requested quantity, available-stock indication.
- Order summary.
- Save/Create actions according to supported lifecycle.

**Components**
- `FormSection`, `SelectInput`, `DatePicker`, `OrderItemsTable`, `NumberInput`, `OperationSummary`.

**Critical UX**
- Show stock availability from the backend.
- Clearly show insufficient-stock errors.
- Do not promise stock reservation unless reservation is implemented.
- Do not trust client-calculated stock availability as the final authority.

### Screen 18 — Outbound Order Details

**Purpose:** Review an outbound order and its fulfillment progress.

**Layout**
- Reference and status.
- Source warehouse and destination/customer if supported.
- Requested items, requested quantities, allocated/reserved quantities if supported, dispatched quantities.
- Activity/history.
- Actions based on status and role: edit, begin picking, dispatch, cancel only when allowed.

**Components**
- `PageHeader`, `StatusBadge`, `OrderItemsTable`, `ActivityTimeline`, `DropdownMenu`, `ConfirmationDialog`.

### Screen 19 — Picking and Dispatch

**Purpose:** Pick requested products and confirm dispatch.

**Layout**
- Order summary and source warehouse.
- Picking checklist/table:
  - Product/SKU.
  - Required quantity.
  - Location if available.
  - Picked quantity.
  - Picking status.
- Dispatch summary.
- Shipment linkage only if the domain supports it.
- Orange “Confirm Dispatch” action.

**Components**
- `PickingChecklist`, `WarehouseLocationPicker`, `NumberInput`, `OperationSummary`, `ConfirmationDialog`.

**Critical UX**
- Distinguish picking from dispatch confirmation.
- Show shortages or mismatches before dispatch.
- Explain that confirmation changes inventory.
- Prevent accidental double submission; show processing state.
- Backend remains authoritative for stock validation and transaction consistency.

---

## Group H — Shipment Management (2 screens)

### Screen 20 — Shipments List

**Purpose:** Monitor outgoing shipments.

**Layout**
- Header “Shipments”.
- Search by shipment reference/tracking number.
- Filters: shipment status, date range, destination/carrier only if modeled.
- Table columns:
  - Shipment reference.
  - Related outbound order.
  - Destination.
  - Carrier if supported.
  - Tracking number.
  - Dispatch date.
  - Status.
  - Actions.

**Components**
- `TableToolbar`, `DataTable`, `StatusBadge`, `TablePagination`.

### Screen 21 — Shipment Details

**Purpose:** View and update shipment progress.

**Layout**
- Shipment reference and status.
- Related outbound order.
- Destination and recipient details only if supported.
- Carrier and tracking number if supported.
- Status stepper/timeline.
- Shipment events/history.
- Update status action for authorized Shipment Manager users.

**Components**
- `PageHeader`, `ShipmentStatusStepper`, `ActivityTimeline`, `KeyValueList`, `SideDrawer`, `ConfirmationDialog`.

**Important**
- Use only shipment statuses defined by the backend/domain model.
- Do not invent live map tracking or carrier API integrations.

---

## Group I — Reports and Analytics (2 screens)

### Screen 22 — Reports Dashboard

**Purpose:** Provide a consolidated view of warehouse operations.

**Layout**
- Date range selector.
- Summary metrics.
- Report categories/cards:
  - Inventory summary.
  - Inbound activity.
  - Outbound activity.
  - Shipment performance.
  - Stock movement.
- Charts with titles, legends, units, and date ranges.
- Export controls only if supported.

**Components**
- `DateRangePicker`, `StatCard`, `ChartCard`, `ReportCard`, `PrimaryButton`.

**Behavior**
- Clearly label units and time ranges.
- Avoid decorative charts without operational meaning.
- Use empty states when data is unavailable.

### Screen 23 — Report Details

**Purpose:** Inspect one selected report.

**Layout**
- Report title and description.
- Date range and applicable warehouse filters.
- Main chart or summary.
- Detailed data table.
- Export/print action only if implemented.
- Last-updated timestamp when available.

**Components**
- `PageHeader`, `DateRangePicker`, `ChartCard`, `DataTable`, `FilterChips`.

---

## Group J — User Management (3 screens)

### Screen 24 — Users List

**Purpose:** Administer application users.

**Layout**
- Header “User Management” and “Add User” action for administrators.
- Search by name/email.
- Filters: role and account status.
- Table columns:
  - User.
  - Email.
  - Assigned role(s), according to the role model.
  - Account status.
  - Created date.
  - Last activity only if tracked.
  - Actions.

**Components**
- `PageHeader`, `TableToolbar`, `DataTable`, `Avatar`, `StatusBadge`, `DropdownMenu`.

### Screen 25 — User Details / Create / Edit

**Purpose:** View or maintain a user account.

**Detail mode**
- Name and email.
- Assigned role(s).
- Account status.
- Account metadata permitted for display.

**Create/edit mode**
- Name.
- Email.
- Role assignment.
- Account status if editable.
- Password setup/reset handled according to the authentication design.

**Components**
- `FormSection`, `TextInput`, `SelectInput`, `Checkbox`, `KeyValueList`, `PrimaryButton`.

**Behavior**
- Only authorized administrators can manage users.
- Do not display plaintext passwords.
- Show a clear warning before disabling an account or changing privileged access.

### Screen 26 — Roles and Permissions

**Purpose:** Make the five-role authorization model understandable to administrators.

**Roles**
- Administrator.
- Warehouse Manager.
- Warehouse Employee.
- Shipment Manager.
- Viewer / Auditor.

**Layout**
- Role list or role cards.
- Selected role description.
- Permission matrix grouped by module/action.
- Read-only or editable matrix depending on whether custom permission editing is supported.
- Clear distinction between viewing and performing actions.

**Components**
- `RoleCard`, `PermissionMatrix`, `Checkbox` (only if permission editing is implemented), `AlertBanner`.

**Important**
- The five roles and permission definitions must match `PROJECT_DETAILS.md` and `SECURITY_AND_TESTING.md`.
- Do not invent custom-role creation or arbitrary permission editing if the backend supports only predefined roles.

---

## Group K — Audit Logs (1 screen)

### Screen 27 — Audit Logs

**Purpose:** Provide traceability for important actions.

**Layout**
- Search by user, entity, or reference.
- Filters: action type, module/entity, user, date range.
- Table columns:
  - Timestamp.
  - User.
  - Action.
  - Module/entity.
  - Record reference.
  - Result.
- Row opens a detail drawer with available before/after values and metadata.

**Components**
- `TableToolbar`, `DateRangePicker`, `DataTable`, `SideDrawer`, `KeyValueList`, `StatusBadge`.

**Behavior**
- Read-only.
- Do not expose secrets, password values, tokens, or sensitive authentication data.
- Show only audit fields actually captured by the backend.

---

## Group L — Account and Settings (2 screens)

### Screen 28 — My Profile

**Purpose:** Let the signed-in user view and maintain permitted personal account details.

**Layout**
- Profile summary/avatar.
- Name and email.
- Assigned role displayed as read-only.
- Editable profile fields only if supported.
- Password change section only if supported by the authentication design.
- Save/cancel actions.

**Components**
- `Avatar`, `FormSection`, `TextInput`, `PrimaryButton`, `AlertBanner`.

### Screen 29 — System Settings

**Purpose:** Configure supported application-wide settings.

**Layout**
- Settings navigation or tabs.
- Sections only for real settings supported by the product.
- Examples may include organization/warehouse defaults, notification preferences, or operational configuration only if these are confirmed requirements.
- Save and cancel actions.
- Confirmation for settings that affect operations.

**Components**
- `TabNavigation`, `FormSection`, `SelectInput`, `Checkbox`, `PrimaryButton`, `ConfirmationDialog`.

**Important**
- Do not invent settings or expose infrastructure/security configuration through the UI.
- Keep secrets, database settings, and server configuration out of the browser application.

---

## 7. Cross-screen interaction standards

### 7.1 Tables
- Search should be clearly separated from filters.
- Keep the most important columns visible first.
- Use consistent date, quantity, and status formatting.
- Row actions belong in a final actions column or a dropdown.
- Provide loading skeletons, empty states, no-result states, and error states.
- Use pagination for long datasets.
- On tablet/mobile, allow horizontal scrolling or a carefully designed card alternative; do not shrink text until unreadable.

### 7.2 Forms
- Use clear section headings.
- Keep labels visible.
- Mark required fields explicitly.
- Validate on blur and submit without overwhelming users while typing.
- Preserve entered values when a recoverable server error occurs.
- Disable submit during processing and prevent duplicate submissions.
- Show success/error feedback after server responses.

### 7.3 Destructive and high-impact operations
Use confirmation dialogs for:
- Deleting/deactivating important records.
- Cancelling orders when allowed.
- Confirming goods receipt.
- Confirming dispatch.
- Any action that changes stock or operational state.

Confirmation dialog must explain the consequence in plain language and identify the affected record. Use an appropriately styled danger action for destructive operations; do not use orange as a substitute for danger red.

### 7.4 Status consistency
Use the same label, color, and icon semantics wherever the same status appears. The actual status names and lifecycle must come from the backend/domain specification.

### 7.5 Accessibility
- Maintain readable contrast.
- Do not encode meaning with color alone.
- Provide visible keyboard focus.
- Use descriptive labels for icon-only buttons.
- Use appropriate heading hierarchy.
- Ensure dialogs have clear titles and actions.
- Keep touch targets usable on tablet/mobile.

---

## 8. Responsive behavior

Desktop is the primary target, but the designs must adapt.

### Desktop (approximately 1280px and above)
- Expanded sidebar by default.
- Full data tables.
- Multi-column KPI cards.
- Main content uses available width with comfortable spacing.

### Tablet (approximately 768px–1279px)
- Sidebar collapses to icon rail or drawer.
- KPI cards use two columns.
- Tables may scroll horizontally.
- Forms use one or two columns depending on field complexity.

### Mobile (below approximately 768px)
- Sidebar becomes a navigation drawer.
- Top bar remains compact.
- KPI cards stack or use two columns when readable.
- Tables become scrollable or use summary cards.
- Forms use one column.
- Primary actions remain easy to reach.
- Avoid trying to reproduce the desktop sidebar as a tiny fixed panel.

Do not remove important operational information on smaller screens; reorganize it.

---

## 9. Stitch generation instructions

Use this document as the source of truth for Google Stitch.

### 9.1 Global prompt to prepend to every Stitch request

> Design a high-fidelity screen for a professional Logistics Warehouse Management System web application. Follow the attached design specification exactly. Use the Industrial Orange Light Mode design system: charcoal sidebar `#242B35`, industrial orange primary `#C45D16`, accent orange `#F28C28`, light application background `#F6F7F9`, white surfaces `#FFFFFF`, primary text `#18212F`, secondary text `#64748B`, and borders `#E2E8F0`. Use Inter exclusively, with a consistent enterprise typography scale. Use a fixed/collapsible dark sidebar, white 64px topbar, clear page header, restrained borders, subtle shadows, 8–12px component radii, and Lucide-style outline icons. The visual style must be clean, operational, modern, and information-dense without clutter. Avoid dark mode, neon colors, gradients, glassmorphism, oversized rounded cards, and marketing-website styling. Reuse the shared components and interaction patterns in the specification. Show realistic sample data clearly as mock data, never as verified production data. Ensure clear hierarchy, readable tables, accessible contrast, and responsive layout.

### 9.2 Generation strategy

Do not ask Stitch to generate all 29 pages in one image or one canvas. Generate in controlled groups so consistency is easier to maintain.

Recommended order:
1. Design foundation: app shell, sidebar, topbar, buttons, fields, cards, table, badges, modal.
2. Dashboard.
3. Product and warehouse screens.
4. Inventory screens.
5. Inbound screens.
6. Outbound screens.
7. Shipment screens.
8. Reports screens.
9. User management and audit screens.
10. Profile and settings.
11. Authentication screens.

For every group:
- Reuse the same shell and component styles.
- Ask Stitch to maintain visual consistency with the approved foundation.
- Generate desktop first, then request tablet/mobile adaptations.
- Review all text, data labels, table columns, and actions against this document.
- Do not let Stitch invent unsupported business rules or features.

### 9.3 Screen-specific prompt format

For each screen, provide:
1. The global prompt above.
2. The exact screen name and purpose.
3. The screen's layout and required sections from this document.
4. The components it must reuse.
5. The actions and states to show.
6. The target viewport (start with desktop 1440px wide).

### 9.4 Important design handoff rules

- Treat generated designs as visual specifications, not as proof that a backend feature exists.
- Confirm all field names, statuses, quantities, permissions, and workflows against the project Markdown requirements.
- If a requirement is marked “if supported”, do not present it as mandatory until the domain/backend design confirms it.
- Do not silently add supplier/customer modules, approval workflows, warehouse hierarchies, live tracking, or integrations.
- Keep all five roles consistent across navigation, screen actions, and permission states.
- Keep the screen inventory at 29 unless the project scope is explicitly changed.

---

## 10. Final design checklist

Before approving a generated screen, verify:

- [ ] Uses Industrial Orange Light Mode.
- [ ] Uses Inter only.
- [ ] Uses the exact approved color tokens.
- [ ] Uses the shared sidebar and topbar on authenticated screens.
- [ ] Has a clear page title and content hierarchy.
- [ ] Reuses established components.
- [ ] Has realistic but clearly illustrative sample data.
- [ ] Uses consistent status badges.
- [ ] Shows only role-permitted actions.
- [ ] Includes appropriate empty/loading/error states where relevant.
- [ ] Handles high-impact operations with clear confirmation.
- [ ] Does not invent unsupported business rules or integrations.
- [ ] Remains readable at the target viewport.
- [ ] Has a responsive adaptation plan.

**Final visual identity:** Industrial Orange · Light Mode · Inter · Charcoal navigation · Clean enterprise operations UI.
