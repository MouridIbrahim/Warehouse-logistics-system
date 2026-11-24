-- Low stock threshold for products
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10;
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products (low_stock_threshold);
