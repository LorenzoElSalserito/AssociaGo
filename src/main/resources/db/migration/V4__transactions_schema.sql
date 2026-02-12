-- V4__transactions_schema.sql
-- Financial module schema

CREATE TABLE IF NOT EXISTS transaction_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'INCOME', 'EXPENSE'
    description TEXT,
    parent_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES transaction_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL, -- 'INCOME', 'EXPENSE'
    category_id INTEGER,
    description TEXT,
    payment_method TEXT, -- 'CASH', 'BANK_TRANSFER', 'PAYPAL', 'CARD', 'OTHER'
    reference_id TEXT, -- External reference (e.g., bank transaction ID)
    user_id INTEGER, -- Linked member (optional)
    event_id INTEGER, -- Linked event (optional)
    activity_id INTEGER, -- Linked activity (optional)
    receipt_path TEXT, -- Path to uploaded receipt file
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER, -- User ID who created the record
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES transaction_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    number TEXT NOT NULL, -- e.g., "2026-001"
    date DATE NOT NULL,
    due_date DATE,
    recipient_name TEXT NOT NULL,
    recipient_tax_code TEXT,
    recipient_address TEXT,
    recipient_email TEXT,
    user_id INTEGER, -- Linked member (optional)
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'OVERDUE'
    notes TEXT,
    pdf_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(association_id, number)
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    transaction_id INTEGER, -- Link to the actual money movement
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    method TEXT,
    notes TEXT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
