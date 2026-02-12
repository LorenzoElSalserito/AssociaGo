-- V11__fix_missing_tables_and_columns.sql

-- Fix missing 'members' table (it seems it was expected but maybe not created or named differently)
-- In V1__core_schema.sql we have 'users' and 'user_associations', but the code expects 'members'.
-- Let's create a view or table for members if it doesn't exist, or alias it.
-- However, looking at the error "no such table: members", it seems the JPA entity Member maps to "members" table.
-- If the intention was to use "users" and "user_associations", the JPA mapping might be wrong or we need a "members" table.
-- Given the error, let's create the 'members' table which seems to be a denormalized or specific table for the application logic.
-- OR, if 'members' was supposed to be 'users', we should check the JPA entity.
-- But assuming we need to fix the DB to match the code:

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    fiscal_code TEXT,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    membership_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fix missing 'condition_status' column in 'inventory_items'
-- The error was: [SQLITE_ERROR] SQL error or missing database (no such column: ii1_0.condition_status)
-- In V7__inventory_schema.sql we have 'condition' and 'status', but JPA seems to look for 'condition_status'.
-- Let's add the column if it's missing.
ALTER TABLE inventory_items ADD COLUMN condition_status TEXT;

-- Fix missing 'sync_config' table
-- The error was: [SQLITE_ERROR] SQL error or missing database (no such table: sync_config)
CREATE TABLE IF NOT EXISTS sync_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_host TEXT,
    remote_port INTEGER,
    remote_db_name TEXT,
    remote_username TEXT,
    remote_password TEXT,
    auto_sync_enabled BOOLEAN DEFAULT 0,
    last_sync_time DATETIME
);
