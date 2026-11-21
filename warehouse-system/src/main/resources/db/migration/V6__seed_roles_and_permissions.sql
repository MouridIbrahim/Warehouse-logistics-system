-- Seed the baseline role catalogue and permission codes (idempotent)
INSERT INTO roles (name, description) VALUES
    ('ADMINISTRATOR', 'Full system administration'),
    ('WAREHOUSE_MANAGER', 'Warehouse operations oversight'),
    ('WAREHOUSE_EMPLOYEE', 'Day-to-day operational tasks'),
    ('SHIPMENT_MANAGER', 'Shipment record management'),
    ('VIEWER_AUDITOR', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (code, description) VALUES
    ('USER_MANAGE', 'Manage users and role assignments'),
    ('PRODUCT_READ', 'View products'),
    ('PRODUCT_MANAGE', 'Create/update/deactivate products'),
    ('WAREHOUSE_MANAGE', 'Manage warehouses and storage locations'),
    ('INBOUND_CONFIRM', 'Record and confirm inbound receiving'),
    ('INVENTORY_VIEW', 'View inventory and movements'),
    ('INVENTORY_ADJUST', 'Manually adjust inventory'),
    ('OUTBOUND_DISPATCH', 'Create outbound orders and confirm dispatch'),
    ('SHIPMENT_UPDATE', 'Manage shipments and status transitions'),
    ('AUDIT_READ', 'View audit history')
ON CONFLICT (code) DO NOTHING;
