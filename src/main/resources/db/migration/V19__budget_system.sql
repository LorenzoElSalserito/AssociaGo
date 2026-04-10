-- V19__budget_system.sql
-- Budget management: annual budgets with line items, forecast support

CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'CLOSED'
    approved_by INTEGER,
    approved_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(association_id, year)
);

CREATE TABLE IF NOT EXISTS budget_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    budget_id INTEGER NOT NULL,
    category_id INTEGER,
    label TEXT NOT NULL,
    type TEXT NOT NULL, -- 'INCOME', 'EXPENSE'
    budgeted_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    actual_amount DECIMAL(10, 2) DEFAULT 0.00,
    forecast_amount DECIMAL(10, 2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES transaction_categories(id) ON DELETE SET NULL
);
