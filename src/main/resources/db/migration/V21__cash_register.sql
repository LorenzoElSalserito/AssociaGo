-- V21__cash_register.sql
-- Daily cash register with opening/closing balance and movements

CREATE TABLE IF NOT EXISTS cash_registers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    date DATE NOT NULL,
    opened_by INTEGER NOT NULL,
    closed_by INTEGER,
    opening_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    closing_balance DECIMAL(10, 2),
    total_income DECIMAL(10, 2) DEFAULT 0.00,
    total_expense DECIMAL(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'OPEN', -- 'OPEN', 'CLOSED', 'RECONCILED'
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (opened_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(association_id, date)
);

CREATE TABLE IF NOT EXISTS cash_register_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cash_register_id INTEGER NOT NULL,
    transaction_id INTEGER,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL, -- 'INCOME', 'EXPENSE'
    description TEXT NOT NULL,
    payment_method TEXT DEFAULT 'CASH',
    time DATETIME DEFAULT CURRENT_TIMESTAMP,
    receipt_number TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
