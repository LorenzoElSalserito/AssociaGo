-- V25__annual_balance.sql
-- Annual financial balance (bilancio consuntivo) with auto-computed lines and digital signatures

CREATE TABLE IF NOT EXISTS annual_balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'COMPUTED', 'APPROVED', 'SIGNED', 'PUBLISHED'
    total_income DECIMAL(10, 2) DEFAULT 0.00,
    total_expenses DECIMAL(10, 2) DEFAULT 0.00,
    net_result DECIMAL(10, 2) DEFAULT 0.00,
    opening_fund DECIMAL(10, 2) DEFAULT 0.00,
    closing_fund DECIMAL(10, 2) DEFAULT 0.00,
    computed_at DATETIME,
    approved_by INTEGER,
    approved_at DATETIME,
    signatories TEXT, -- JSON: [{"name": "...", "role": "PRESIDENT", "signed_at": "...", "signature_path": "..."}]
    pdf_path TEXT,
    checksum TEXT, -- SHA-256 of final PDF
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(association_id, year)
);

CREATE TABLE IF NOT EXISTS annual_balance_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    balance_id INTEGER NOT NULL,
    section TEXT NOT NULL, -- 'INCOME', 'EXPENSE', 'ASSET', 'LIABILITY'
    category_id INTEGER,
    label TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    previous_year_amount DECIMAL(10, 2) DEFAULT 0.00,
    variance DECIMAL(10, 2) DEFAULT 0.00,
    variance_pct DECIMAL(5, 2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    is_subtotal BOOLEAN DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (balance_id) REFERENCES annual_balances(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES transaction_categories(id) ON DELETE SET NULL
);
