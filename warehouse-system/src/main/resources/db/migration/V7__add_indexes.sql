-- Add indexes for performance on frequently queried columns

-- Inventory movements indexes
CREATE INDEX IF NOT EXISTS idx_inventory_movements_occurred_at ON inventory_movements (occurred_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_occurred ON inventory_movements (product_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_ref ON inventory_movements (reference_type, reference_id);

-- Inbound orders indexes
CREATE INDEX IF NOT EXISTS idx_inbound_orders_created_at ON inbound_orders (created_at);
CREATE INDEX IF NOT EXISTS idx_inbound_orders_status ON inbound_orders (status);
CREATE INDEX IF NOT EXISTS idx_inbound_orders_warehouse ON inbound_orders (warehouse_id);

-- Outbound orders indexes
CREATE INDEX IF NOT EXISTS idx_outbound_orders_created_at ON outbound_orders (created_at);
CREATE INDEX IF NOT EXISTS idx_outbound_orders_status ON outbound_orders (status);
CREATE INDEX IF NOT EXISTS idx_outbound_orders_warehouse ON outbound_orders (warehouse_id);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments (created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_occurred_at ON audit_logs (occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_user_id);

-- Inventory balances indexes
CREATE INDEX IF NOT EXISTS idx_inventory_balances_product ON inventory_balances (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_balances_location ON inventory_balances (storage_location_id);
