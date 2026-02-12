-- V2__activities_schema.sql
-- Activities module schema

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'COURSE', 'WORKSHOP', 'SEMINAR', etc.
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    max_participants INTEGER,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_instructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'INSTRUCTOR',
    notes TEXT,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'REGISTERED', -- 'REGISTERED', 'WAITLIST', 'CANCELLED', 'COMPLETED'
    payment_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'PARTIAL', 'REFUNDED'
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS activity_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT, -- 'RENT', 'MATERIALS', 'INSTRUCTOR_FEE', etc.
    incurred_date DATE,
    notes TEXT,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'PERCENTAGE', 'FIXED_AMOUNT'
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    UNIQUE(association_id, code)
);

CREATE TABLE IF NOT EXISTS coupon_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    activity_id INTEGER, -- Nullable if used for event or membership
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    discount_applied DECIMAL(10, 2),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
);
