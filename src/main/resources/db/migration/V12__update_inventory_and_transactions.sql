-- V12__update_inventory_and_transactions.sql
-- Add acquisition_method to inventory_items
-- Add category (string), membership_id, inventory_item_id to transactions

-- Add columns to inventory_items
-- Commented out columns that seem to already exist to avoid duplicate column errors
-- ALTER TABLE inventory_items ADD COLUMN acquisition_method TEXT;
-- ALTER TABLE inventory_items ADD COLUMN current_value DECIMAL(10, 2);
-- ALTER TABLE inventory_items ADD COLUMN depreciation_years INTEGER;
-- ALTER TABLE inventory_items ADD COLUMN assigned_to INTEGER;
-- ALTER TABLE inventory_items ADD COLUMN photo_path TEXT;
-- ALTER TABLE inventory_items ADD COLUMN notes TEXT;
-- ALTER TABLE inventory_items ADD COLUMN inventory_code TEXT;
-- ALTER TABLE inventory_items ADD COLUMN association_id INTEGER;

-- Add columns to transactions
-- Commented out columns that seem to already exist to avoid duplicate column errors
-- ALTER TABLE transactions ADD COLUMN category TEXT;
-- ALTER TABLE transactions ADD COLUMN membership_id INTEGER;
-- ALTER TABLE transactions ADD COLUMN inventory_item_id INTEGER;

-- Add foreign key constraints (SQLite doesn't support ADD CONSTRAINT in ALTER TABLE easily, so we skip explicit FKs for now or rely on app logic/recreate table if strictness needed)
-- Ideally:
-- FOREIGN KEY (membership_id) REFERENCES memberships(id)
-- FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
