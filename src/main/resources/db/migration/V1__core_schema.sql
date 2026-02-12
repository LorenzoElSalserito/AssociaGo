-- V1__core_schema.sql
-- Core tables migration from Go version

CREATE TABLE IF NOT EXISTS associations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tax_code TEXT,
    vat_number TEXT,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    province TEXT,
    email TEXT,
    phone TEXT,
    president TEXT,
    secretary TEXT,
    treasurer TEXT,
    logo_path TEXT,
    statute_path TEXT,
    regulation_path TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS association_db_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    db_type TEXT NOT NULL, -- 'sqlite' or 'mariadb'
    host TEXT,
    port INTEGER,
    db_name TEXT,
    username TEXT,
    password TEXT,
    is_active BOOLEAN DEFAULT 0,
    last_sync DATETIME,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS association_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    fiscal_year_start_month INTEGER DEFAULT 1,
    fiscal_year_end_month INTEGER DEFAULT 12,
    currency_symbol TEXT DEFAULT '€',
    language TEXT DEFAULT 'it',
    theme TEXT DEFAULT 'light',
    backup_frequency TEXT DEFAULT 'daily',
    backup_path TEXT,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_password TEXT,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    tax_code TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    birth_place TEXT,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_associations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    association_id INTEGER NOT NULL,
    membership_card_number TEXT,
    role TEXT DEFAULT 'MEMBER', -- 'PRESIDENT', 'SECRETARY', 'TREASURER', 'ADMIN', 'MEMBER'
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'RESIGNED'
    join_date DATE,
    expiration_date DATE,
    last_renewal_date DATE,
    notes TEXT,
    is_board_member BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    UNIQUE(user_id, association_id)
);

CREATE TABLE IF NOT EXISTS deletion_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    deleted_by TEXT,
    deletion_reason TEXT,
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    original_data TEXT -- JSON snapshot
);
