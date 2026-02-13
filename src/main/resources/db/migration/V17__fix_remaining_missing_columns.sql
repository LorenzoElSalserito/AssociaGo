-- V17: Add all remaining missing columns to align DB schema with JPA entities

-- ========================================
-- ACTIVITY_PARTICIPANTS TABLE (6 missing columns)
-- ========================================
ALTER TABLE activity_participants ADD COLUMN is_paid BOOLEAN DEFAULT 0;
ALTER TABLE activity_participants ADD COLUMN payment_method TEXT;
ALTER TABLE activity_participants ADD COLUMN payment_date DATE;
ALTER TABLE activity_participants ADD COLUMN is_active BOOLEAN DEFAULT 1;
ALTER TABLE activity_participants ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE activity_participants ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- ========================================
-- ACTIVITY_INSTRUCTORS TABLE (8 missing columns)
-- ========================================
ALTER TABLE activity_instructors ADD COLUMN first_name TEXT;
ALTER TABLE activity_instructors ADD COLUMN last_name TEXT;
ALTER TABLE activity_instructors ADD COLUMN email TEXT;
ALTER TABLE activity_instructors ADD COLUMN phone TEXT;
ALTER TABLE activity_instructors ADD COLUMN specialization TEXT;
ALTER TABLE activity_instructors ADD COLUMN is_active BOOLEAN DEFAULT 1;
ALTER TABLE activity_instructors ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE activity_instructors ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- ========================================
-- EVENT_PARTICIPANTS TABLE (2 missing columns)
-- ========================================
ALTER TABLE event_participants ADD COLUMN payment_method TEXT;
ALTER TABLE event_participants ADD COLUMN payment_date DATE;

-- ========================================
-- INVENTORY_LOANS TABLE (3 missing columns)
-- Entity uses user_association_id but V7 created member_id
-- ========================================
ALTER TABLE inventory_loans ADD COLUMN user_association_id INTEGER;
ALTER TABLE inventory_loans ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE inventory_loans ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- ========================================
-- USERS TABLE (1 missing column)
-- Frontend sends gender but no column exists
-- ========================================
ALTER TABLE users ADD COLUMN gender TEXT;
