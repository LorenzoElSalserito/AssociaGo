-- V14__add_missing_tables_and_columns.sql
-- Fix: Create 9 missing tables and add 13 missing columns to match JPA entities

-- ==========================================
-- 1. notifications (Notification.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    related_entity_type TEXT,
    related_entity_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. payment_methods (PaymentMethod.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    has_commission BOOLEAN DEFAULT 0,
    fixed_commission DECIMAL(19,2) DEFAULT 0.00,
    percentage_commission DECIMAL(19,2) DEFAULT 0.00,
    configuration TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. accounts (Account.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parent_account_id INTEGER,
    balance DECIMAL(19,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. journal_entries (JournalEntry.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    transaction_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. journal_entry_lines (JournalEntryLine.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    debit DECIMAL(19,2) NOT NULL DEFAULT 0.00,
    credit DECIMAL(19,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- ==========================================
-- 6. activity_schedules (ActivitySchedule.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS activity_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    instructor_id INTEGER,
    location TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. volunteer_expenses (VolunteerExpense.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS volunteer_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    volunteer_id INTEGER NOT NULL,
    shift_id INTEGER,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    receipt_path TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    transaction_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. assembly_documents (AssemblyDocument.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS assembly_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assembly_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. assembly_votes (AssemblyVote.java)
-- ==========================================
CREATE TABLE IF NOT EXISTS assembly_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assembly_id INTEGER NOT NULL,
    motion_id INTEGER NOT NULL,
    user_association_id INTEGER NOT NULL,
    vote TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ALTER TABLE: activities — 8 missing columns
-- ==========================================
ALTER TABLE activities ADD COLUMN subscription_type TEXT;
ALTER TABLE activities ADD COLUMN schedule_details TEXT;
ALTER TABLE activities ADD COLUMN require_registration BOOLEAN DEFAULT 1;
ALTER TABLE activities ADD COLUMN generate_invoice BOOLEAN DEFAULT 0;
ALTER TABLE activities ADD COLUMN image_path TEXT;
ALTER TABLE activities ADD COLUMN document_path TEXT;
ALTER TABLE activities ADD COLUMN cancellation_date DATE;
ALTER TABLE activities ADD COLUMN cancellation_reason TEXT;

-- ==========================================
-- ALTER TABLE: events — 4 missing columns
-- ==========================================
ALTER TABLE events ADD COLUMN require_registration BOOLEAN DEFAULT 1;
ALTER TABLE events ADD COLUMN generate_invoice BOOLEAN DEFAULT 0;
ALTER TABLE events ADD COLUMN cancellation_date DATETIME;
ALTER TABLE events ADD COLUMN cancellation_reason TEXT;

-- ==========================================
-- ALTER TABLE: members — 1 missing column
-- ==========================================
ALTER TABLE members ADD COLUMN member_type TEXT DEFAULT 'Socio Ordinario';
