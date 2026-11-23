import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from '../features/landing/LandingPage'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { RequireAuth } from '../features/auth/RequireAuth'
import { RequireRole } from '../features/auth/RequireRole'
import { ADMIN, AUDIT_VIEW, SHIPMENT_VIEW } from '../features/auth/permissions'
import { AppLayout } from '../components/layout/AppLayout'
import { AccessDeniedPage } from '../components/layout/AccessDeniedPage'

const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProductsPage = lazy(() =>
  import('../features/products/ProductsPage').then((m) => ({ default: m.ProductsPage })),
)
const WarehousesPage = lazy(() =>
  import('../features/warehouses/WarehousesPage').then((m) => ({ default: m.WarehousesPage })),
)
const WarehouseDetailsPage = lazy(() =>
  import('../features/warehouses/WarehouseDetailsPage').then((m) => ({ default: m.WarehouseDetailsPage })),
)
const InventoryPage = lazy(() =>
  import('../features/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage })),
)
const InboundOrdersPage = lazy(() =>
  import('../features/inbound/InboundOrdersPage').then((m) => ({ default: m.InboundOrdersPage })),
)
const CreateInboundOrderPage = lazy(() =>
  import('../features/inbound/CreateInboundOrderPage').then((m) => ({ default: m.CreateInboundOrderPage })),
)
const InboundOrderDetailsPage = lazy(() =>
  import('../features/inbound/InboundOrderDetailsPage').then((m) => ({ default: m.InboundOrderDetailsPage })),
)
const OutboundOrdersPage = lazy(() =>
  import('../features/outbound/OutboundOrdersPage').then((m) => ({ default: m.OutboundOrdersPage })),
)
const CreateOutboundOrderPage = lazy(() =>
  import('../features/outbound/CreateOutboundOrderPage').then((m) => ({ default: m.CreateOutboundOrderPage })),
)
const OutboundOrderDetailsPage = lazy(() =>
  import('../features/outbound/OutboundOrderDetailsPage').then((m) => ({ default: m.OutboundOrderDetailsPage })),
)
const ShipmentsPage = lazy(() =>
  import('../features/shipments/ShipmentsPage').then((m) => ({ default: m.ShipmentsPage })),
)
const ShipmentDetailsPage = lazy(() =>
  import('../features/shipments/ShipmentDetailsPage').then((m) => ({ default: m.ShipmentDetailsPage })),
)
const ReportsPage = lazy(() =>
  import('../features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)
const UsersPage = lazy(() =>
  import('../features/users/UsersPage').then((m) => ({ default: m.UsersPage })),
)
const AuditLogsPage = lazy(() =>
  import('../features/audit/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })),
)
const ProfilePage = lazy(() =>
  import('../features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const RolesPage = lazy(() =>
  import('../features/roles/RolesPage').then((m) => ({ default: m.RolesPage })),
)
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'access-denied', element: <AccessDeniedPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'warehouses', element: <WarehousesPage /> },
      { path: 'warehouses/:id', element: <WarehouseDetailsPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inbound', element: <InboundOrdersPage /> },
      { path: 'inbound/new', element: <CreateInboundOrderPage /> },
      { path: 'inbound/:id', element: <InboundOrderDetailsPage /> },
      { path: 'outbound', element: <OutboundOrdersPage /> },
      { path: 'outbound/new', element: <CreateOutboundOrderPage /> },
      { path: 'outbound/:id', element: <OutboundOrderDetailsPage /> },
      {
        path: 'shipments',
        element: (
          <RequireRole roles={SHIPMENT_VIEW}>
            <ShipmentsPage />
          </RequireRole>
        ),
      },
      {
        path: 'shipments/:id',
        element: (
          <RequireRole roles={SHIPMENT_VIEW}>
            <ShipmentDetailsPage />
          </RequireRole>
        ),
      },
      { path: 'reports', element: <ReportsPage /> },
      {
        path: 'audit-logs',
        element: (
          <RequireRole roles={AUDIT_VIEW}>
            <AuditLogsPage />
          </RequireRole>
        ),
      },
      {
        path: 'users',
        element: (
          <RequireRole roles={ADMIN}>
            <UsersPage />
          </RequireRole>
        ),
      },
      {
        path: 'roles',
        element: (
          <RequireRole roles={ADMIN}>
            <RolesPage />
          </RequireRole>
        ),
      },
      {
        path: 'settings',
        element: (
          <RequireRole roles={ADMIN}>
            <SettingsPage />
          </RequireRole>
        ),
      },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])
