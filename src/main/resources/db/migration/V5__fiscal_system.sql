-- V5__fiscal_system.sql
-- Advanced fiscal system schema

CREATE TABLE IF NOT EXISTS fiscal_year_closures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'OPEN', -- 'OPEN', 'CLOSING', 'CLOSED'
    total_income DECIMAL(10, 2) DEFAULT 0.00,
    total_expenses DECIMAL(10, 2) DEFAULT 0.00,
    net_balance DECIMAL(10, 2) DEFAULT 0.00,
    members_count INTEGER DEFAULT 0,
    closed_by INTEGER, -- User ID
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(association_id, year)
);

CREATE TABLE IF NOT EXISTS fiscal_comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    base_year INTEGER NOT NULL,
    comparison_year INTEGER NOT NULL,
    generated_by INTEGER, -- User ID
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    pdf_path TEXT,
    csv_path TEXT,
    checksum TEXT, -- SHA-256 of the generated document
    data_snapshot TEXT, -- JSON content of the comparison data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(association_id, base_year, comparison_year, generated_at)
);

CREATE TABLE IF NOT EXISTS invoice_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    check_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_by INTEGER, -- User ID
    total_invoices INTEGER DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_collected DECIMAL(10, 2) DEFAULT 0.00,
    total_outstanding DECIMAL(10, 2) DEFAULT 0.00,
    numbering_ok BOOLEAN DEFAULT 1,
    numbering_issues TEXT, -- JSON list of issues
    payment_ok BOOLEAN DEFAULT 1,
    payment_issues TEXT, -- JSON list of issues
    overdue_count INTEGER DEFAULT 0,
    overdue_amount DECIMAL(10, 2) DEFAULT 0.00,
    pdf_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (checked_by) REFERENCES users(id) ON DELETE SET NULL
);
