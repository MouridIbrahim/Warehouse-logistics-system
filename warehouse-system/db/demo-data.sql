-- ============================================================================
-- Demo / seed data generator
-- Populates ~1000 rows per core table for performance & pagination testing.
--
-- Re-runnable: removes existing "DEMO-*" data first, then re-inserts fresh.
--
-- Run from warehouse-system/ :
--   docker compose cp db\demo-data.sql db:/tmp/demo-data.sql
--   docker compose exec db psql -U postgres -d logistics_db -f /tmp/demo-data.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Cleanup (children first, to respect foreign keys)
-- ---------------------------------------------------------------------------
DELETE FROM shipment_status_history
 WHERE shipment_id IN (SELECT id FROM shipments WHERE tracking_number LIKE 'DEMO-%');
DELETE FROM shipments WHERE tracking_number LIKE 'DEMO-%';
DELETE FROM outbound_order_items
 WHERE outbound_order_id IN (SELECT id FROM outbound_orders WHERE reference_number LIKE 'DEMO-%');
DELETE FROM outbound_orders WHERE reference_number LIKE 'DEMO-%';
DELETE FROM inbound_order_items
 WHERE inbound_order_id IN (SELECT id FROM inbound_orders WHERE reference_number LIKE 'DEMO-%');
DELETE FROM inbound_orders WHERE reference_number LIKE 'DEMO-%';
DELETE FROM inventory_movements
 WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'DEMO-%');
DELETE FROM inventory_balances
 WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'DEMO-%');
DELETE FROM audit_logs WHERE action = 'DEMO_SEED';
DELETE FROM storage_locations WHERE code LIKE 'DEMO-%';
DELETE FROM products WHERE sku LIKE 'DEMO-%';
DELETE FROM warehouses WHERE code = 'DEMO-WH';

-- ---------------------------------------------------------------------------
-- 2. Seed
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  admin_id bigint := COALESCE(
      (SELECT id FROM users WHERE username = 'admin'),
      (SELECT id FROM users ORDER BY id LIMIT 1));
  wh_id   bigint;
  p_id    bigint;
  loc_id  bigint;
  o_id    bigint;
  s_id    bigint;
  i       int;
BEGIN
  -- Warehouse
  INSERT INTO warehouses (code, name, address, active)
  VALUES ('DEMO-WH', 'Demo Warehouse', 'Demo address', true)
  RETURNING id INTO wh_id;

  -- 100 storage locations
  FOR i IN 1..100 LOOP
    INSERT INTO storage_locations (warehouse_id, code, name, active)
    VALUES (wh_id, 'DEMO-LOC-' || lpad(i::text, 3, '0'), 'Demo Location ' || i, true);
  END LOOP;

  -- 1000 products + one inventory balance each
  FOR i IN 1..1000 LOOP
    INSERT INTO products (sku, name, description, unit_of_measure, active)
    VALUES ('DEMO-' || lpad(i::text, 6, '0'), 'Demo Product ' || i,
            'Fake product for performance testing', 'pcs', true)
    RETURNING id INTO p_id;

    SELECT id INTO loc_id FROM storage_locations
     WHERE code = 'DEMO-LOC-' || lpad((((i - 1) % 100) + 1)::text, 3, '0');

    INSERT INTO inventory_balances (product_id, storage_location_id, quantity_on_hand, version)
    VALUES (p_id, loc_id, (random() * 500)::int, 0);
  END LOOP;

  -- 500 inbound orders (CONFIRMED) + 1 item + 1 INBOUND movement each
  FOR i IN 1..500 LOOP
    INSERT INTO inbound_orders (reference_number, warehouse_id, status, received_at, created_by, notes)
    VALUES ('DEMO-INB-' || lpad(i::text, 6, '0'), wh_id, 'CONFIRMED',
            now() - (i || ' minutes')::interval, admin_id, 'demo')
    RETURNING id INTO o_id;

    SELECT id INTO p_id FROM products WHERE sku = 'DEMO-' || lpad(i::text, 6, '0');
    SELECT id INTO loc_id FROM storage_locations
     WHERE code = 'DEMO-LOC-' || lpad((((i - 1) % 100) + 1)::text, 3, '0');

    INSERT INTO inbound_order_items (inbound_order_id, product_id, storage_location_id, received_quantity)
    VALUES (o_id, p_id, loc_id, (random() * 100 + 1)::int);

    INSERT INTO inventory_movements
        (product_id, storage_location_id, movement_type, quantity_delta, reference_type, reference_id, performed_by, occurred_at)
    VALUES (p_id, loc_id, 'INBOUND', (random() * 100 + 1)::int, 'INBOUND_ORDER', o_id,
            admin_id, now() - (i || ' minutes')::interval);
  END LOOP;

  -- 500 outbound orders (400 DISPATCHED + 100 DRAFT) + 1 item each
  FOR i IN 1..500 LOOP
    INSERT INTO outbound_orders (reference_number, warehouse_id, status, requested_at, created_by, notes)
    VALUES ('DEMO-OUT-' || lpad(i::text, 6, '0'), wh_id,
            CASE WHEN i <= 400 THEN 'DISPATCHED' ELSE 'DRAFT' END,
            now() - (i || ' minutes')::interval, admin_id, 'demo')
    RETURNING id INTO o_id;

    SELECT id INTO p_id FROM products WHERE sku = 'DEMO-' || lpad(i::text, 6, '0');
    SELECT id INTO loc_id FROM storage_locations
     WHERE code = 'DEMO-LOC-' || lpad((((i - 1) % 100) + 1)::text, 3, '0');

    INSERT INTO outbound_order_items (outbound_order_id, product_id, storage_location_id, requested_quantity)
    VALUES (o_id, p_id, loc_id, (random() * 50 + 1)::int);

    IF i <= 400 THEN
      INSERT INTO inventory_movements
          (product_id, storage_location_id, movement_type, quantity_delta, reference_type, reference_id, performed_by, occurred_at)
      VALUES (p_id, loc_id, 'OUTBOUND', -((random() * 50 + 1)::int), 'OUTBOUND_ORDER', o_id,
              admin_id, now() - (i || ' minutes')::interval);

      INSERT INTO shipments (tracking_number, outbound_order_id, carrier_name, status, shipped_at)
      VALUES ('DEMO-TRK-' || lpad(i::text, 6, '0'), o_id, 'Demo Carrier', 'IN_TRANSIT',
              now() - (i || ' minutes')::interval)
      RETURNING id INTO s_id;

      INSERT INTO shipment_status_history (shipment_id, previous_status, new_status, changed_by, changed_at)
      VALUES (s_id, 'PENDING', 'IN_TRANSIT', admin_id, now() - (i || ' minutes')::interval);
    END IF;
  END LOOP;

  -- 1000 standalone ADJUSTMENT movements
  FOR i IN 1..1000 LOOP
    SELECT id INTO p_id FROM products WHERE sku = 'DEMO-' || lpad((((i - 1) % 1000) + 1)::text, 6, '0');
    SELECT id INTO loc_id FROM storage_locations
     WHERE code = 'DEMO-LOC-' || lpad((((i - 1) % 100) + 1)::text, 3, '0');

    INSERT INTO inventory_movements
        (product_id, storage_location_id, movement_type, quantity_delta, reference_type, performed_by, occurred_at, notes)
    VALUES (p_id, loc_id, 'ADJUSTMENT',
            CASE WHEN i % 2 = 0 THEN (random() * 19 + 1)::int ELSE -((random() * 19 + 1)::int) END,
            'ADJUSTMENT', admin_id, now() - (i || ' minutes')::interval, 'demo adjustment');
  END LOOP;

  -- 1000 audit logs
  FOR i IN 1..1000 LOOP
    INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, occurred_at, metadata)
    VALUES (admin_id, 'DEMO_SEED', 'PRODUCT', (i % 1000) + 1,
            now() - (i || ' seconds')::interval, '{"seed":"demo"}');
  END LOOP;
END $$;

COMMIT;

-- ---------------------------------------------------------------------------
-- 3. Report resulting row counts
-- ---------------------------------------------------------------------------
SELECT 'warehouses'            AS table_name, count(*) AS rows FROM warehouses
UNION ALL SELECT 'storage_locations',   count(*) FROM storage_locations
UNION ALL SELECT 'products',            count(*) FROM products
UNION ALL SELECT 'inventory_balances',  count(*) FROM inventory_balances
UNION ALL SELECT 'inventory_movements', count(*) FROM inventory_movements
UNION ALL SELECT 'inbound_orders',      count(*) FROM inbound_orders
UNION ALL SELECT 'inbound_order_items', count(*) FROM inbound_order_items
UNION ALL SELECT 'outbound_orders',     count(*) FROM outbound_orders
UNION ALL SELECT 'outbound_order_items',count(*) FROM outbound_order_items
UNION ALL SELECT 'shipments',           count(*) FROM shipments
UNION ALL SELECT 'shipment_status_history', count(*) FROM shipment_status_history
UNION ALL SELECT 'audit_logs',          count(*) FROM audit_logs
ORDER BY table_name;
