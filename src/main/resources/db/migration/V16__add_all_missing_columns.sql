-- V16: Add all missing columns to align DB schema with JPA entities

-- ========================================
-- TRANSACTIONS TABLE (11 missing columns)
-- ========================================
ALTER TABLE transactions ADD COLUMN category TEXT;
ALTER TABLE transactions ADD COLUMN membership_id INTEGER;
ALTER TABLE transactions ADD COLUMN inventory_item_id INTEGER;
ALTER TABLE transactions ADD COLUMN is_verified BOOLEAN DEFAULT 0;
ALTER TABLE transactions ADD COLUMN verified_by INTEGER;
ALTER TABLE transactions ADD COLUMN verified_at DATETIME;
ALTER TABLE transactions ADD COLUMN is_renewal BOOLEAN DEFAULT 0;
ALTER TABLE transactions ADD COLUMN renewal_year INTEGER;
ALTER TABLE transactions ADD COLUMN quota_period TEXT;
ALTER TABLE transactions ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE transactions ADD COLUMN net_amount DECIMAL(10,2);

-- ========================================
-- ASSEMBLIES TABLE (8 missing columns)
-- ========================================
ALTER TABLE assemblies ADD COLUMN association_id INTEGER DEFAULT 0;
ALTER TABLE assemblies ADD COLUMN start_time TEXT;
ALTER TABLE assemblies ADD COLUMN end_time TEXT;
ALTER TABLE assemblies ADD COLUMN president TEXT;
ALTER TABLE assemblies ADD COLUMN secretary TEXT;
ALTER TABLE assemblies ADD COLUMN is_quorum_reached BOOLEAN DEFAULT 0;
ALTER TABLE assemblies ADD COLUMN minutes_path TEXT;
ALTER TABLE assemblies ADD COLUMN notes TEXT;

-- ========================================
-- INVENTORY_ITEMS TABLE (8 missing columns)
-- ========================================
ALTER TABLE inventory_items ADD COLUMN association_id INTEGER DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN inventory_code TEXT;
ALTER TABLE inventory_items ADD COLUMN acquisition_method TEXT;
ALTER TABLE inventory_items ADD COLUMN current_value DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN depreciation_years INTEGER;
ALTER TABLE inventory_items ADD COLUMN assigned_to INTEGER;
ALTER TABLE inventory_items ADD COLUMN photo_path TEXT;
ALTER TABLE inventory_items ADD COLUMN notes TEXT;

-- ========================================
-- ACTIVITY_COSTS TABLE (6 missing columns)
-- ========================================
ALTER TABLE activity_costs ADD COLUMN is_recurring BOOLEAN DEFAULT 0;
ALTER TABLE activity_costs ADD COLUMN frequency TEXT;
ALTER TABLE activity_costs ADD COLUMN supplier TEXT;
ALTER TABLE activity_costs ADD COLUMN receipt_path TEXT;
ALTER TABLE activity_costs ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE activity_costs ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- ========================================
-- ACTIVITY_PARTICIPANTS TABLE (8 missing columns)
-- ========================================
ALTER TABLE activity_participants ADD COLUMN cancellation_date DATE;
ALTER TABLE activity_participants ADD COLUMN cancellation_reason TEXT;
ALTER TABLE activity_participants ADD COLUMN coupon_code TEXT;
ALTER TABLE activity_participants ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE activity_participants ADD COLUMN discount_type TEXT;
ALTER TABLE activity_participants ADD COLUMN expiration_date DATE;
ALTER TABLE activity_participants ADD COLUMN invoice_id INTEGER;
ALTER TABLE activity_participants ADD COLUMN original_amount DECIMAL(10,2) DEFAULT 0.00;

-- ========================================
-- ACTIVITY_INSTRUCTORS TABLE (4 missing columns)
-- ========================================
ALTER TABLE activity_instructors ADD COLUMN certifications TEXT;
ALTER TABLE activity_instructors ADD COLUMN compensation DECIMAL(10,2);
ALTER TABLE activity_instructors ADD COLUMN compensation_type TEXT;
ALTER TABLE activity_instructors ADD COLUMN user_association_id INTEGER;

-- ========================================
-- EVENT_PARTICIPANTS TABLE (1 missing column)
-- ========================================
ALTER TABLE event_participants ADD COLUMN invoice_id INTEGER;

-- ========================================
-- ASSEMBLY_PARTICIPANTS TABLE (1 missing column)
-- ========================================
ALTER TABLE assembly_participants ADD COLUMN check_out_time DATETIME;

-- ========================================
-- INVENTORY_LOANS TABLE (2 missing columns)
-- ========================================
ALTER TABLE inventory_loans ADD COLUMN condition_on_loan TEXT;
ALTER TABLE inventory_loans ADD COLUMN condition_on_return TEXT;
