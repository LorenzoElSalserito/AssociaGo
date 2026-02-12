CREATE TABLE inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    quantity INTEGER DEFAULT 0,
    location TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    condition TEXT, -- 'NEW', 'GOOD', 'FAIR', 'POOR', 'BROKEN'
    status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'IN_USE', 'LOANED', 'LOST', 'DISPOSED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    loan_date DATETIME NOT NULL,
    expected_return_date DATETIME,
    actual_return_date DATETIME,
    notes TEXT,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'RETURNED', 'OVERDUE'
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
