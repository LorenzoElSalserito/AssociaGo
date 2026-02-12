-- V3__events_enhanced_schema.sql
-- Events module schema

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT, -- 'MEETING', 'PARTY', 'FUNDRAISER', etc.
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME,
    location TEXT,
    address TEXT,
    max_participants INTEGER,
    cost_member DECIMAL(10, 2) DEFAULT 0.00,
    cost_non_member DECIMAL(10, 2) DEFAULT 0.00,
    is_public BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'PLANNED', -- 'PLANNED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER, -- Nullable for non-members
    guest_name TEXT, -- If user_id is null
    guest_email TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'REGISTERED', -- 'REGISTERED', 'WAITLIST', 'CANCELLED'
    check_in_time DATETIME,
    payment_status TEXT DEFAULT 'PENDING',
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS event_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT,
    incurred_date DATE,
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
