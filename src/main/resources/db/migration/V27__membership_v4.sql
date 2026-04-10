-- Consensi e basi giuridiche
CREATE TABLE IF NOT EXISTS member_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id),
    association_id INTEGER NOT NULL REFERENCES associations(id),
    consent_type VARCHAR(50) NOT NULL,
    lawful_basis VARCHAR(50),
    granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scoring completezza anagrafica
ALTER TABLE members ADD COLUMN completeness_score INTEGER DEFAULT 0;

-- Categorie socio europee
ALTER TABLE members ADD COLUMN member_category VARCHAR(50) DEFAULT 'ordinary';
