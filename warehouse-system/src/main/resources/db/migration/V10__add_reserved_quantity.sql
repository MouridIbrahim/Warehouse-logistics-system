-- Stock reservation support
ALTER TABLE inventory_balances ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER NOT NULL DEFAULT 0;

ALTER TABLE inventory_balances ADD CONSTRAINT chk_reserved_quantity_not_negative CHECK (reserved_quantity >= 0);

ALTER TABLE inventory_balances ADD CONSTRAINT chk_reserved_not_exceed_on_hand CHECK (reserved_quantity <= quantity_on_hand);

CREATE INDEX IF NOT EXISTS idx_inventory_balances_reserved ON inventory_balances (reserved_quantity);
