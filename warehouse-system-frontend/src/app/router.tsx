import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { RequireAuth } from '../features/auth/RequireAuth'
import { AppLayout } from '../components/layout/AppLayout'
import { PlaceholderPage } from '../components/layout/PlaceholderPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { ProductsPage } from '../features/products/ProductsPage'
import { WarehousesPage } from '../features/warehouses/WarehousesPage'
import { WarehouseDetailsPage } from '../features/warehouses/WarehouseDetailsPage'
import { InboundOrdersPage } from '../features/inbound/InboundOrdersPage'
import { CreateInboundOrderPage } from '../features/inbound/CreateInboundOrderPage'
import { InboundOrderDetailsPage } from '../features/inbound/InboundOrderDetailsPage'
import { OutboundOrdersPage } from '../features/outbound/OutboundOrdersPage'
import { CreateOutboundOrderPage } from '../features/outbound/CreateOutboundOrderPage'
import { OutboundOrderDetailsPage } from '../features/outbound/OutboundOrderDetailsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'warehouses', element: <WarehousesPage /> },
      { path: 'warehouses/:id', element: <WarehouseDetailsPage /> },
      { path: 'inventory', element: <PlaceholderPage title="Inventory" description="Monitor stock across warehouses." /> },
      { path: 'inbound', element: <InboundOrdersPage /> },
      { path: 'inbound/new', element: <CreateInboundOrderPage /> },
      { path: 'inbound/:id', element: <InboundOrderDetailsPage /> },
      { path: 'outbound', element: <OutboundOrdersPage /> },
      { path: 'outbound/new', element: <CreateOutboundOrderPage /> },
      { path: 'outbound/:id', element: <OutboundOrderDetailsPage /> },
      { path: 'shipments', element: <PlaceholderPage title="Shipments" description="Monitor outgoing shipments." /> },
      { path: 'reports', element: <PlaceholderPage title="Reports & Analytics" description="Consolidated view of warehouse operations." /> },
      { path: 'audit-logs', element: <PlaceholderPage title="Audit Logs" description="Review recorded system and operational activity." /> },
      { path: 'users', element: <PlaceholderPage title="User Management" description="Manage application users and access." /> },
      { path: 'roles', element: <PlaceholderPage title="Roles & Permissions" description="Understand the authorization model." /> },
      { path: 'settings', element: <PlaceholderPage title="System Settings" description="Configure application-wide settings." /> },
      { path: 'profile', element: <PlaceholderPage title="My Profile" description="View and manage your account." /> },
    ],
  },
])
