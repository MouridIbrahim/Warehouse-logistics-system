# Stitch Prompts — Logistics Warehouse Management System

**Purpose:** Copy one prompt at a time into Google Stitch to generate the corresponding screen.

**Locked design direction:** Industrial Orange · Light Mode · Inter · Modern Enterprise SaaS.

## How to use this file

1. Generate Screen 01–02 without the authenticated shell.
2. Generate Screen 03 first among authenticated pages and use it to establish/approve the shared shell.
3. Reuse the approved shell and component language for Screens 04–29.
4. Generate one screen per Stitch request. Do not ask Stitch to create a 29-screen collage.
5. If Stitch supports attaching reference images or prior designs, attach the approved dashboard/shell when generating later authenticated screens.
6. Review every generated screen against the project requirements. A visual mockup does not prove that a feature or business rule exists.

## Global design prompt

Paste this global prompt before the screen-specific prompt each time:

> You are designing a high-fidelity screen for the Logistics Warehouse Management System. Follow this visual system exactly:
> - Theme: Industrial Orange, Light Mode. This is an authenticated enterprise operations web app, not a marketing website.
> - Colors: charcoal sidebar #242B35; primary industrial orange #C45D16; primary hover #A94B0D; accent orange #F28C28; app background #F6F7F9; cards/surfaces #FFFFFF; primary text #18212F; secondary text #64748B; borders #E2E8F0.
> - Semantic statuses: success #15803D with pale #DCFCE7 background; warning #B45309 with #FEF3C7; info #2563EB with #DBEAFE; danger #DC2626 with #FEE2E2; neutral #64748B with #F1F5F9. Use status colors consistently and never use orange as a generic status color.
> - Typography: Inter only. Page title 28px/700; section title 20px/600; card title 16px/600; body 14px/400; table text 13–14px; labels 13px/500; buttons 14px/600; metadata 12px; KPI numbers 28–32px/700. Use tabular numerals for numeric data.
> - Layout: desktop-first 1440px viewport; 250px charcoal sidebar; 64px white topbar with subtle bottom border; main content background #F6F7F9 with 24–32px padding. Cards white with subtle #E2E8F0 border and 12px radius; inputs/buttons 8px radius; dialogs 14–16px radius. Use restrained shadows only.
> - Use consistent Lucide-style outline icons (18–20px). No emoji icons.
> - Style: modern enterprise SaaS, clear hierarchy, operational, clean, information-dense but not cluttered. Avoid gradients, glassmorphism, neon, oversized rounded cards, decorative illustrations, and dark mode.
> - Auth screens use the same brand colors and Inter but do not show the authenticated sidebar.
> - On authenticated screens use the shared shell: sidebar with LOGISTICS / WAREHOUSE SYSTEM branding and grouped navigation (Overview: Dashboard; Catalog & Storage: Products, Warehouses, Inventory; Operations: Inbound Operations, Outbound Operations, Shipments; Insights: Reports & Analytics, Audit Logs; Administration: User Management, Roles & Permissions, System Settings; Account: My Profile). Highlight the current item with #C45D16. The visible navigation/actions should reflect the specified user's role for this screen.
> - Use realistic illustrative sample data and label it as sample/mock data where appropriate. Do not imply sample values are live production data.
> - Do not invent business rules, statuses, integrations, supplier/customer modules, approval workflows, warehouse hierarchies, or live tracking. If a field is not confirmed, omit it or mark it as optional rather than presenting it as required.
> - Show sensible loading/empty/error states only as secondary variants or annotations; the primary frame should show a populated, realistic state.
> - Use accessible contrast, visible labels, keyboard-focus styling where relevant, and clear action hierarchy.
> Create one screen only. Do not create a multi-page collage or an entire dashboard template unless this prompt explicitly asks for it.
> 

---

## Screen-specific prompts

### 01 — Login

> Create the Login screen for warehouse staff.
Purpose: sign in to the application.
Layout: centered compact white login panel on a #F6F7F9 background; small LOGISTICS brand mark and “WAREHOUSE SYSTEM” label; heading “Welcome back”; short subtitle “Sign in to manage your warehouse operations”; labeled email/username field; labeled password field with show/hide icon; “Forgot password?” link; full-width industrial-orange “Sign In” button. Add a restrained footer with product name/version only if useful.
Show a realistic invalid-credentials inline error state as a small secondary example, but keep the main form clean. Do not add self-registration or social login. No sidebar or authenticated topbar.
Components: AuthLayout, TextInput, PasswordInput, PrimaryButton, InlineValidationMessage.
Ensure generous whitespace, precise alignment, and a polished desktop composition.

### 02 — Forgot Password

> Create the Forgot Password screen.
Purpose: allow a user to request password recovery.
Use the same centered authentication layout and branding as the Login screen, with no sidebar. Include back-to-login link, heading “Reset your password”, short explanation, labeled email field, full-width orange “Send reset instructions” button, and a subtle success confirmation state below or as an alternate state. The confirmation wording must not reveal whether an account exists.
Components: AuthLayout, TextInput, PrimaryButton, AlertBanner. Keep the design visually consistent with Login.

### 03 — Main Dashboard

> Create the Main Dashboard for a signed-in Warehouse Manager.
Use the full authenticated shell and highlight Dashboard in the sidebar. Header: “Dashboard” and supporting text “Here’s an overview of warehouse operations.” Show six KPI cards: Total Products, Total Warehouses, Inventory Overview, Pending Inbound, Pending Outbound, Active Shipments. Use plausible sample figures and mark the screen as illustrative/mock data in a subtle way. Below, use a balanced two-column layout: a meaningful operations trend chart with legend/date range on the left; recent activity timeline on the right; low-stock/attention alerts and role-permitted quick actions below. Use orange only for brand actions and chart emphasis, with semantic colors for statuses. Keep charts restrained, labeled, and useful. Do not invent metrics beyond these categories or show unsupported workflow approvals.
Components: AppSidebar, AppTopbar, PageHeader, StatCard, ChartCard, ActivityTimeline, AlertBanner, QuickActionCard.

### 04 — Products List

> Create the Products List screen for a Warehouse Manager.
Use authenticated shell; highlight Products. Page header “Products”, description “Manage the product catalogue”, and orange “Add Product” button. Add a search box that searches product name, SKU, or barcode. Filters: category and product status. Main table columns: Product (with small thumbnail placeholder or initials, not decorative photography), SKU, Category, Unit of Measure only if represented as a simple optional field, Stock Summary only if shown as informational data, Status, Updated, Actions. Include realistic sample rows, status badges, row overflow menu, pagination, and clear table density. Avoid excessive KPI cards. Show no unsupported bulk actions.
Components: PageHeader, TableToolbar, SearchInput, SelectInput, DataTable, StatusBadge, TablePagination, DropdownMenu.

### 05 — Product Details / Create / Edit

> Create the Product Details screen in read-only detail mode, with a clear visible “Edit Product” action for authorized users and a secondary “Back to Products” breadcrumb. Use authenticated shell; Products active. Header should show product name, SKU, and status badge. Main layout: left/main column with product information sections (description, category, SKU, unit if supported); right column with compact summary card and stock-by-warehouse summary only if available. Include a tab or section for product activity only if supported. Make the page reusable for create/edit mode by showing a clear form structure in a small secondary panel or design note: product name, SKU, category, description, optional image. Do not invent required fields or extra attributes. Components: PageHeader, FormSection, TextInput, SelectInput, Textarea, KeyValueList, StatusBadge, PrimaryButton.

### 06 — Warehouses List

> Create the Warehouses List screen.
Authenticated shell; highlight Warehouses. Header “Warehouses”, short description, orange “Add Warehouse” action for authorized users. Include search and status filter. Table columns: Warehouse Name, Code, Location/Address summary, Capacity or occupancy only if the data model supports it, Storage Locations count only if available, Status, Actions. Use clear table hierarchy, realistic sample rows, status badges, pagination, and compact row actions. Do not add a map or warehouse floor plan. Components: PageHeader, TableToolbar, SearchInput, SelectInput, DataTable, StatusBadge, TablePagination.

### 07 — Warehouse Details

> Create a Warehouse Details screen for one selected warehouse.
Authenticated shell; Warehouses active; breadcrumb Warehouses / WH-KM-001. Header includes warehouse name, code, status, and permitted Edit action. Show location/contact information only where applicable. Use 3–4 summary cards for stock/SKU count, storage locations, capacity/utilization only if supported. Main body uses tabs: Overview, Storage Locations, Inventory, Activity. Overview shows clean key-value details and a recent operations panel. Use realistic mock data, but avoid invented capacity or location hierarchy. Components: PageHeader, StatCard, TabNavigation, KeyValueList, DataTable, ActivityTimeline, StatusBadge.

### 08 — Storage Locations Management

> Create the Storage Locations Management screen scoped to a selected warehouse.
Authenticated shell; Warehouses active. Breadcrumb Warehouses / Central Warehouse / Storage Locations. Header “Storage Locations” with “Add Location” action if permitted. Provide location search and only confirmed filters such as status or type; do not assume zone/aisle/rack/shelf/bin hierarchy. Table columns: Location Code, Warehouse, Type only if supported, Capacity/Occupancy only if supported, Status, Actions. Include a right-side drawer or modal preview for Add/Edit Location with minimal fields: location code, warehouse, optional type/status according to supported schema. Components: PageHeader, SearchInput, SelectInput, DataTable, SideDrawer, FormField, StatusBadge.

### 09 — Inventory Overview

> Create the Inventory Overview screen.
Authenticated shell; highlight Inventory. Header “Inventory” and description “Monitor stock across warehouses.” Summary cards: Total SKUs, Total On-hand Units, Low-stock Items, Reserved Stock only if reservation exists. Search by product/SKU. Filters: warehouse, category, stock status. Table columns: Product, SKU, Warehouse, Storage Location if available, On-hand Quantity, Reserved Quantity if supported, Available Quantity if supported, Stock Status. Use tabular numerals and aligned quantities. Low-stock uses warning semantic styling, not brand orange. Include pagination and clear empty state as a secondary variant. Components: StatCard, TableToolbar, DataTable, QuantityDisplay, StatusBadge, FilterChips.

### 10 — Stock Details

> Create the Stock Details screen for a selected product in a selected warehouse.
Authenticated shell; Inventory active. Header identifies product, SKU, warehouse, and breadcrumb back to Inventory. Prominent quantity breakdown cards for On-hand, Reserved and Available only if those concepts exist; damaged/quarantined only if confirmed. Include a location allocation table if location data exists and a recent stock movement summary. Show “Adjust Stock” only if adjustments are part of the confirmed workflow and user is authorized; otherwise omit it. Clearly distinguish current balance from historical movement. Components: PageHeader, InventoryQuantityBreakdown, StatCard, DataTable, AlertBanner, ConfirmationDialog.

### 11 — Stock Movement History

> Create the Stock Movement History screen.
Authenticated shell; Inventory active. Header “Stock Movement History”. Add search by product/SKU/reference and filters for warehouse, movement type, date range, and user. Table columns: Date & Time, Product/SKU, Warehouse/Location, Movement Type, Quantity Change with +/−, Reference, Performed By. Use semantic labels for inbound/outbound/adjustment based on sample data, but do not imply unsupported movement types. Clicking a row opens a detail drawer showing available metadata and before/after balance only if recorded. Screen is read-only. Components: TableToolbar, DateRangePicker, DataTable, ActivityTimeline, SideDrawer, QuantityDisplay.

### 12 — Inbound Orders List

> Create the Inbound Orders List screen.
Authenticated shell; highlight Inbound Operations. Header “Inbound Operations”, description “Track expected and received goods”, orange “Create Inbound Order” button for permitted roles. Summary strip: Awaiting Receipt, Partially Received only if supported, Completed. Search by inbound reference and supplier/source only if supplier is modeled. Filters: status, destination warehouse, date range. Table columns: Inbound Reference, Supplier/Source if supported, Destination Warehouse, Expected Date, Item Count, Status, Actions. Use clear status badges, pagination, realistic sample data. Components: StatCard, TableToolbar, DataTable, StatusBadge, TablePagination.

### 13 — Create Inbound Order

> Create the Create Inbound Order form screen.
Authenticated shell; Inbound Operations active. Breadcrumb Inbound Operations / New Inbound Order. Page title “Create Inbound Order”. Use a structured form with sections: General Information (destination warehouse, expected date, supplier/source only if modeled, reference according to backend-generated/manual rule, notes); Items (product selector, expected quantity, unit only if supported, add/remove rows); Order Summary (item count and total quantities). Place Save Draft/Create actions only if those lifecycle states exist. Use a wide main form with a compact summary panel on the right. Clearly validate required fields and positive quantities. Do not invent purchase-order integration or supplier fields if not in scope. Components: FormSection, SelectInput, DatePicker, OrderItemsTable, NumberInput, Textarea, OperationSummary, PrimaryButton.

### 14 — Inbound Order Details

> Create the Inbound Order Details screen.
Authenticated shell; Inbound Operations active. Header shows inbound reference, status badge, destination warehouse, expected date, and permitted actions. Main content: order summary; items table with Product, SKU, Expected Quantity, Received Quantity, Remaining Quantity; supplier/source only if modeled. Include receipt history/activity timeline if partial receiving is supported. Prominent “Receive Goods” action for eligible statuses and permitted roles. Cancellation only if supported, with confirmation. Use tabs only if they improve clarity. Components: PageHeader, StatusBadge, OrderItemsTable, ActivityTimeline, SideDrawer, ConfirmationDialog.

### 15 — Receive Goods

> Create the Receive Goods operational screen for an inbound order.
Authenticated shell; Inbound Operations active. Header includes inbound reference and destination warehouse. Show order summary at top. Main receiving table columns: Product/SKU, Expected Quantity, Previously Received if applicable, Quantity Received Now input, Difference/Discrepancy indicator, Storage Location selector if supported, Notes if required. Add a clear receipt summary showing the quantities that will be added to inventory. Use a strong orange “Confirm Receipt” button and a secondary Cancel/Back action. Include a confirmation dialog previewing the inventory impact. Make quantity inputs prominent and easy to use. Support partial receipt only if domain rules allow it. Never show direct editing of the stock balance. Components: ReceivingQuantityInput, WarehouseLocationPicker, OrderItemsTable, Textarea, OperationSummary, ConfirmationDialog.

### 16 — Outbound Orders List

> Create the Outbound Orders List screen.
Authenticated shell; highlight Outbound Operations. Header “Outbound Operations”, description “Manage orders leaving your warehouses”, orange “Create Outbound Order” action for permitted users. KPI strip may show Awaiting Processing, Picking, Ready for Dispatch, Dispatched only where these statuses exist. Search by outbound reference and customer only if customer is modeled. Filters: status, source warehouse, date range. Table columns: Outbound Reference, Customer/Destination if supported, Source Warehouse, Created Date, Item Count, Status, Actions. Use semantic status badges and pagination. Components: StatCard, TableToolbar, DataTable, StatusBadge, TablePagination.

### 17 — Create Outbound Order

> Create the Create Outbound Order form screen.
Authenticated shell; Outbound Operations active. Breadcrumb Outbound Operations / New Outbound Order. Header “Create Outbound Order”. Sections: General Information (source warehouse, requested date, customer/destination only if modeled, notes); Items editor (product, requested quantity, backend-provided available-stock indication); Order Summary. Show insufficient stock feedback clearly and inline. Do not imply stock is reserved unless reservation is implemented. Do not treat client-side availability as authoritative. Place Create/Save actions according to supported lifecycle. Components: FormSection, SelectInput, DatePicker, OrderItemsTable, NumberInput, OperationSummary, InlineValidationMessage.

### 18 — Outbound Order Details

> Create the Outbound Order Details screen.
Authenticated shell; Outbound Operations active. Header with outbound reference, status, source warehouse, destination/customer only if supported, and permitted actions. Main sections: order summary; items table showing requested quantity and dispatched quantity, plus allocated/reserved quantity only if supported; activity/history timeline. Show contextual next action such as “Start Picking” or “Go to Dispatch” only when valid for the current status and role. Edit/cancel only if permitted and supported. Components: PageHeader, StatusBadge, OrderItemsTable, ActivityTimeline, DropdownMenu, ConfirmationDialog.

### 19 — Picking and Dispatch

> Create the Picking and Dispatch operational screen.
Authenticated shell; Outbound Operations active. Show outbound order reference and source warehouse. Main picking checklist/table columns: Product/SKU, Required Quantity, Storage Location if available, Picked Quantity input, Picking Status. Include a compact order summary and shortages/mismatch alerts. Distinguish the picking step from final dispatch confirmation. Show a prominent orange “Confirm Dispatch” action only when eligible. Confirmation dialog must clearly state that dispatch will update inventory. Prevent accidental double submission with loading/disabled state. Shipment linkage only if supported. Components: PickingChecklist, WarehouseLocationPicker, NumberInput, OperationSummary, AlertBanner, ConfirmationDialog.

### 20 — Shipments List

> Create the Shipments List screen.
Authenticated shell; highlight Shipments. Header “Shipments” with short description. Search by shipment reference or tracking number. Filters: shipment status, date range, destination/carrier only if modeled. Table columns: Shipment Reference, Related Outbound Order, Destination, Carrier if supported, Tracking Number, Dispatch Date, Status, Actions. Use consistent shipment status badges, compact row actions, and pagination. Do not show live map tracking or carrier integrations unless explicitly supported. Components: PageHeader, TableToolbar, DataTable, StatusBadge, TablePagination.

### 21 — Shipment Details

> Create the Shipment Details screen.
Authenticated shell; Shipments active. Header with shipment reference, status badge, and authorized “Update Status” action for Shipment Manager. Show related outbound order, destination/recipient only if supported, carrier and tracking number only if present. Main visual: a clean horizontal or vertical shipment status stepper using only statuses defined by the backend, plus event/activity timeline. Include a shipment information key-value panel. Do not invent live map tracking, GPS, or carrier API integration. Components: PageHeader, ShipmentStatusStepper, ActivityTimeline, KeyValueList, SideDrawer, ConfirmationDialog.

### 22 — Reports Dashboard

> Create the Reports Dashboard screen.
Authenticated shell; highlight Reports & Analytics. Header “Reports & Analytics” and date range selector. Show a restrained set of summary metrics and report cards for Inventory Summary, Inbound Activity, Outbound Activity, Shipment Performance, and Stock Movement. Include one or two meaningful charts with clear labels, units, legends, and date range. Use orange as a restrained series/highlight and semantic colors only where meaningful. Export actions only if supported. Avoid decorative charts and excessive KPI tiles. Components: PageHeader, DateRangePicker, StatCard, ChartCard, ReportCard, PrimaryButton.

### 23 — Report Details

> Create a Report Details screen for one selected report, such as Inventory Summary.
Authenticated shell; Reports & Analytics active. Header includes report title, concise description, date range, and applicable warehouse filter. Main area: one clear chart or summary visualization; below it, a detailed data table with meaningful columns and aligned numeric values. Include export/print action only if implemented. Show last-updated timestamp only if available. Ensure chart labels, units, legend, and selected period are readable. Components: PageHeader, DateRangePicker, SelectInput, ChartCard, DataTable, FilterChips.

### 24 — Users List

> Create the User Management — Users List screen for Administrator.
Authenticated shell; highlight User Management. Header “User Management”, description “Manage application users and access”, orange “Add User” button. Search by name/email. Filters: role and account status. Table columns: User (avatar, name, email), Assigned Role, Account Status, Created Date, Last Activity only if tracked, Actions. Include realistic mock users assigned to the five defined roles: Administrator, Warehouse Manager, Warehouse Employee, Shipment Manager, Viewer / Auditor. Use pagination and compact row menu. This screen is administrator-only. Components: PageHeader, TableToolbar, DataTable, Avatar, StatusBadge, DropdownMenu.

### 25 — User Details / Create / Edit

> Create the User Details screen in detail mode for an Administrator, with a visible Edit action and clear route to create/edit form mode.
Authenticated shell; User Management active. Header shows user name, email, account status, and assigned role. Detail sections: profile information, role assignment, account status, and permitted account metadata. Include a small form-mode layout preview with fields Name, Email, Role, and Account Status where supported. Password must never be displayed; password setup/reset follows the authentication design and must not expose secrets. Show a warning/confirmation pattern for disabling an account or changing privileged access. Components: PageHeader, FormSection, TextInput, SelectInput, Checkbox, KeyValueList, ConfirmationDialog.

### 26 — Roles and Permissions

> Create the Roles and Permissions administration screen for Administrator.
Authenticated shell; User Management / Roles & Permissions active. Show five predefined role cards or a role list: Administrator, Warehouse Manager, Warehouse Employee, Shipment Manager, Viewer / Auditor. Selecting a role displays its description and a structured permission matrix grouped by modules: Dashboard, Products, Warehouses, Inventory, Inbound, Outbound, Shipments, Reports, Users, Audit Logs, Settings. Distinguish View, Create, Update, Delete, Receive, Dispatch, and Manage only where defined by the project's permission matrix. Default to a read-only matrix unless custom permission editing is confirmed. Do not invent custom roles or arbitrary permission editing. Components: RoleCard, PermissionMatrix, TabNavigation, AlertBanner.

### 27 — Audit Logs

> Create the Audit Logs screen.
Authenticated shell; highlight Audit Logs for users with permission. Header “Audit Logs”, short explanation “Review recorded system and operational activity”. Filters: search by user/entity/reference; action type; module/entity; user; date range. Table columns: Timestamp, User, Action, Module/Entity, Record Reference, Result. Clicking a row opens a right-side detail drawer with available metadata and before/after values only if captured. Read-only screen. Never expose passwords, tokens, secrets, or sensitive authentication payloads. Components: PageHeader, TableToolbar, DateRangePicker, DataTable, SideDrawer, KeyValueList, StatusBadge.

### 28 — My Profile

> Create the My Profile screen for any authenticated user.
Authenticated shell; highlight My Profile in the account area. Header “My Profile” with a short account-management description. Show avatar/profile summary, full name, email, and assigned role as read-only unless profile editing is supported. If editing is supported, use a clearly grouped Personal Information form with Save and Cancel. Password change section appears only if supported by the authentication design. Do not expose internal user IDs or security secrets. Keep the screen simple and personal, but consistent with the enterprise application. Components: Avatar, PageHeader, FormSection, TextInput, PrimaryButton, AlertBanner.

### 29 — System Settings

> Create the System Settings screen for Administrator.
Authenticated shell; highlight System Settings. Header “System Settings” with concise description. Use a left settings sub-navigation or top tabs and a clean form panel. Include only settings that are confirmed product requirements. Potential examples such as default warehouse, notification preferences, or operational configuration must be treated as optional placeholders, not assumed features. Show Save Changes and Cancel actions; add confirmation for settings that materially affect operations. Do not expose database credentials, API secrets, server configuration, or infrastructure controls in the browser. Components: TabNavigation, FormSection, SelectInput, Checkbox, PrimaryButton, ConfirmationDialog.

---

## Final consistency checklist

- [ ] Industrial Orange Light Mode is used on every screen.
- [ ] Inter is the only font family.
- [ ] The exact color tokens are followed.
- [ ] Authenticated pages share the same sidebar and topbar.
- [ ] Sidebar active state and available actions reflect the intended role.
- [ ] Tables, forms, cards, badges, dialogs, and buttons use the shared component language.
- [ ] Status colors remain semantic; orange is reserved for brand actions and emphasis.
- [ ] No unsupported integrations, statuses, entities, or workflows have been invented.
- [ ] Sample data is illustrative, not presented as live data.
- [ ] Each screen has a clear information hierarchy and readable spacing.
- [ ] Desktop design is approved before responsive variants are generated.

## Important implementation note

These prompts are based on the agreed 29-screen first-version inventory. The five roles and their permissions must remain consistent with `PROJECT_DETAILS.md` and `SECURITY_AND_TESTING.md`. Fields marked “if supported” must be confirmed against the backend/domain model before implementation.