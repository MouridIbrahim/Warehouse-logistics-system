-- ============================================================================
-- Realistic seed data generator (~1000 rows per core table)
-- Re-runnable: removes previously seeded data first, then re-inserts.
--
-- Run from warehouse-system/ :
--   docker compose cp db\demo-data.sql db:/tmp/demo-data.sql
--   docker compose exec db psql -U postgres -d logistics_db -f /tmp/demo-data.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Cleanup (children first). Covers the earlier "DEMO-*" run and this seed.
-- ---------------------------------------------------------------------------
DELETE FROM shipment_status_history
 WHERE shipment_id IN (SELECT id FROM shipments
                       WHERE tracking_number LIKE 'DEMO-%' OR tracking_number LIKE 'TRK-%');
DELETE FROM shipments WHERE tracking_number LIKE 'DEMO-%' OR tracking_number LIKE 'TRK-%';
DELETE FROM outbound_order_items
 WHERE outbound_order_id IN (SELECT id FROM outbound_orders
                             WHERE reference_number LIKE 'DEMO-%' OR reference_number LIKE 'SO-%');
DELETE FROM outbound_orders WHERE reference_number LIKE 'DEMO-%' OR reference_number LIKE 'SO-%';
DELETE FROM inbound_order_items
 WHERE inbound_order_id IN (SELECT id FROM inbound_orders
                            WHERE reference_number LIKE 'DEMO-%' OR reference_number LIKE 'PO-%');
DELETE FROM inbound_orders WHERE reference_number LIKE 'DEMO-%' OR reference_number LIKE 'PO-%';
DELETE FROM inventory_movements
 WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'DEMO-%' OR sku LIKE 'SKU-%');
DELETE FROM inventory_balances
 WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'DEMO-%' OR sku LIKE 'SKU-%');
DELETE FROM audit_logs WHERE metadata = '{"source":"seed"}' OR metadata = '{"seed":"demo"}' OR action = 'DEMO_SEED';
DELETE FROM storage_locations WHERE code LIKE 'DEMO-%' OR code ~ '^[A-J]-[0-9]{2}$';
DELETE FROM products WHERE sku LIKE 'DEMO-%' OR sku LIKE 'SKU-%';
DELETE FROM warehouses WHERE code IN ('DEMO-WH', 'DC-001');

-- ---------------------------------------------------------------------------
-- 2. Seed realistic data
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  admin_id bigint := COALESCE(
      (SELECT id FROM users WHERE username = 'admin'),
      (SELECT id FROM users ORDER BY id LIMIT 1));
  wh_id    bigint;
  p_id     bigint;
  loc_id   bigint;
  o_id     bigint;
  s_id     bigint;
  loc_idx  int;
  loc_code text;
  i        int;

  product_names text[] := ARRAY[
    'Wireless Mouse','Mechanical Keyboard','USB-C Hub','Laptop Stand','27in Monitor',
    'HDMI Cable','USB-C Cable','Bluetooth Speaker','Webcam','LED Desk Lamp',
    'Ergonomic Chair','Standing Desk','Chair Mat','Whiteboard','Marker Set',
    'A4 Printer Paper','Stapler','Scissors','Tape Dispenser','File Folder',
    'A5 Notebook','Ballpoint Pens','Calculator','Paper Shredder','Laminator',
    'Power Strip','Extension Cord','Surge Protector','AA Batteries','USB Charger',
    'Headphones','Microphone','Tablet Stand','Phone Case','Screen Protector',
    'Laptop Backpack','Laptop Sleeve','Travel Adapter','Power Bank','SD Card',
    'External SSD','WiFi Router','Network Switch','Ethernet Cable','Patch Panel',
    'Barcode Scanner','Label Printer','Thermal Paper','Shipping Box','Packing Tape'];
  variants text[] := ARRAY['Standard','Premium','Compact','Pro','XL'];
  units    text[] := ARRAY['pcs','pcs','pcs','box','set'];
  carriers text[] := ARRAY['DHL Express','FedEx','UPS','SF Express','Maersk'];
  actions  text[] := ARRAY['PRODUCT_CREATED','INBOUND_CONFIRMED','OUTBOUND_DISPATCHED','SHIPMENT_STATUS_CHANGED','INVENTORY_ADJUSTED'];
  entities text[] := ARRAY['PRODUCT','INBOUND_ORDER','OUTBOUND_ORDER','SHIPMENT','INVENTORY_BALANCE'];
BEGIN
  -- Warehouse (single, per project decision)
  INSERT INTO warehouses (code, name, address, active)
  VALUES ('DC-001', 'Main Distribution Center', '42 Logistics Park, Industrial Zone, Springfield', true)
  RETURNING id INTO wh_id;

  -- 100 storage locations: A-01 .. J-10
  FOR i IN 1..100 LOOP
    loc_code := chr(64 + ((i - 1) / 10) + 1) || '-' || lpad((((i - 1) % 10) + 1)::text, 2, '0');
    INSERT INTO storage_locations (warehouse_id, code, name, active)
    VALUES (wh_id, loc_code,
            'Aisle ' || chr(64 + ((i - 1) / 10) + 1) || ' - Bay ' || lpad((((i - 1) % 10) + 1)::text, 2, '0'),
            true);
  END LOOP;

  -- 1000 products + one inventory balance each
  FOR i IN 1..1000 LOOP
    INSERT INTO products (sku, name, description, unit_of_measure, active)
    VALUES (
      'SKU-' || lpad(i::text, 5, '0'),
      product_names[((i - 1) % 50) + 1] || ' - ' || variants[(((i - 1) / 50) % 5) + 1],
      product_names[((i - 1) % 50) + 1] || ' (' || variants[(((i - 1) / 50) % 5) + 1] || ') for warehouse operations',
      units[((i - 1) % 5) + 1],
      true)
    RETURNING id INTO p_id;

    loc_idx := ((i - 1) % 100) + 1;
    loc_code := chr(64 + ((loc_idx - 1) / 10) + 1) || '-' || lpad((((loc_idx - 1) % 10) + 1)::text, 2, '0');
    SELECT id INTO loc_id FROM storage_locations WHERE code = loc_code;

    INSERT INTO inventory_balances (product_id, storage_location_id, quantity_on_hand, version)
    VALUES (p_id, loc_id, (random() * 500)::int, 0);
  END LOOP;

  -- 500 inbound orders (CONFIRMED) + 1 item + INBOUND movement each
  FOR i IN 1..500 LOOP
    INSERT INTO inbound_orders (reference_number, warehouse_id, status, received_at, created_by, notes)
    VALUES ('PO-2026-' || lpad(i::text, 5, '0'), wh_id, 'CONFIRMED',
            now() - (i || ' minutes')::interval, admin_id, 'Purchase order received')
    RETURNING id INTO o_id;

    SELECT id INTO p_id FROM products WHERE sku = 'SKU-' || lpad(i::text, 5, '0');
    loc_idx := ((i - 1) % 100) + 1;
    loc_code := chr(64 + ((loc_idx - 1) / 10) + 1) || '-' || lpad((((loc_idx - 1) % 10) + 1)::text, 2, '0');
    SELECT id INTO loc_id FROM storage_locations WHERE code = loc_code;

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
    VALUES ('SO-2026-' || lpad(i::text, 5, '0'), wh_id,
            CASE WHEN i <= 400 THEN 'DISPATCHED' ELSE 'DRAFT' END,
            now() - (i || ' minutes')::interval, admin_id, 'Sales order')
    RETURNING id INTO o_id;

    SELECT id INTO p_id FROM products WHERE sku = 'SKU-' || lpad(i::text, 5, '0');
    loc_idx := ((i - 1) % 100) + 1;
    loc_code := chr(64 + ((loc_idx - 1) / 10) + 1) || '-' || lpad((((loc_idx - 1) % 10) + 1)::text, 2, '0');
    SELECT id INTO loc_id FROM storage_locations WHERE code = loc_code;

    INSERT INTO outbound_order_items (outbound_order_id, product_id, storage_location_id, requested_quantity)
    VALUES (o_id, p_id, loc_id, (random() * 50 + 1)::int);

    IF i <= 400 THEN
      INSERT INTO inventory_movements
          (product_id, storage_location_id, movement_type, quantity_delta, reference_type, reference_id, performed_by, occurred_at)
      VALUES (p_id, loc_id, 'OUTBOUND', -((random() * 50 + 1)::int), 'OUTBOUND_ORDER', o_id,
              admin_id, now() - (i || ' minutes')::interval);

      INSERT INTO shipments (tracking_number, outbound_order_id, carrier_name, status, shipped_at)
      VALUES ('TRK-' || lpad(i::text, 7, '0'), o_id, carriers[((i - 1) % 5) + 1], 'IN_TRANSIT',
              now() - (i || ' minutes')::interval)
      RETURNING id INTO s_id;

      INSERT INTO shipment_status_history (shipment_id, previous_status, new_status, changed_by, changed_at)
      VALUES (s_id, 'PENDING', 'IN_TRANSIT', admin_id, now() - (i || ' minutes')::interval);
    END IF;
  END LOOP;

  -- 1000 standalone ADJUSTMENT movements
  FOR i IN 1..1000 LOOP
    SELECT id INTO p_id FROM products WHERE sku = 'SKU-' || lpad((((i - 1) % 1000) + 1)::text, 5, '0');
    loc_idx := ((i - 1) % 100) + 1;
    loc_code := chr(64 + ((loc_idx - 1) / 10) + 1) || '-' || lpad((((loc_idx - 1) % 10) + 1)::text, 2, '0');
    SELECT id INTO loc_id FROM storage_locations WHERE code = loc_code;

    INSERT INTO inventory_movements
        (product_id, storage_location_id, movement_type, quantity_delta, reference_type, performed_by, occurred_at, notes)
    VALUES (p_id, loc_id, 'ADJUSTMENT',
            CASE WHEN i % 2 = 0 THEN (random() * 19 + 1)::int ELSE -((random() * 19 + 1)::int) END,
            'ADJUSTMENT', admin_id, now() - (i || ' minutes')::interval, 'Cycle count correction');
  END LOOP;

  -- 1000 audit logs
  FOR i IN 1..1000 LOOP
    INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, occurred_at, metadata)
    VALUES (admin_id, actions[((i - 1) % 5) + 1], entities[((i - 1) % 5) + 1], (i % 1000) + 1,
            now() - (i || ' seconds')::interval, '{"source":"seed"}');
  END LOOP;
END $$;

COMMIT;

-- ---------------------------------------------------------------------------
-- 3. Report resulting row counts
-- ---------------------------------------------------------------------------
SELECT 'warehouses'             AS table_name, count(*) AS rows FROM warehouses
UNION ALL SELECT 'storage_locations',    count(*) FROM storage_locations
UNION ALL SELECT 'products',             count(*) FROM products
UNION ALL SELECT 'inventory_balances',   count(*) FROM inventory_balances
UNION ALL SELECT 'inventory_movements',  count(*) FROM inventory_movements
UNION ALL SELECT 'inbound_orders',       count(*) FROM inbound_orders
UNION ALL SELECT 'inbound_order_items',  count(*) FROM inbound_order_items
UNION ALL SELECT 'outbound_orders',      count(*) FROM outbound_orders
UNION ALL SELECT 'outbound_order_items', count(*) FROM outbound_order_items
UNION ALL SELECT 'shipments',            count(*) FROM shipments
UNION ALL SELECT 'shipment_status_history', count(*) FROM shipment_status_history
UNION ALL SELECT 'audit_logs',           count(*) FROM audit_logs
ORDER BY table_name;
