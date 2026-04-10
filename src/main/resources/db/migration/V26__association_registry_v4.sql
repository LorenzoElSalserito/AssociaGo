-- Sedi: separare sede legale, operativa, progettuale
CREATE TABLE IF NOT EXISTS association_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL REFERENCES associations(id),
    location_type VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    address VARCHAR(500),
    city VARCHAR(100),
    province VARCHAR(10),
    postal_code VARCHAR(10),
    country VARCHAR(3) DEFAULT 'IT',
    phone VARCHAR(30),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branding multi-logo
ALTER TABLE associations ADD COLUMN secondary_logo_path VARCHAR(500);
ALTER TABLE associations ADD COLUMN partner_logo_path VARCHAR(500);

-- Fascicolo ente
CREATE TABLE IF NOT EXISTS association_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL REFERENCES associations(id),
    document_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scadenzario adempimenti
CREATE TABLE IF NOT EXISTS association_deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL REFERENCES associations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMP,
    completed_by INTEGER REFERENCES users(id),
    reminder_days INTEGER DEFAULT 30,
    recurring BOOLEAN DEFAULT FALSE,
    recurring_months INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
