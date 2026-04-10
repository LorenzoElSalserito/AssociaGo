-- Firme istituzionali di ruolo (presidente, segretario, tesoriere)
-- Utilizzate per bilanci, attestati, verbali e documenti ufficiali
CREATE TABLE IF NOT EXISTS institutional_signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL REFERENCES associations(id),
    signer_role VARCHAR(50) NOT NULL,        -- PRESIDENT, SECRETARY, TREASURER, CUSTOM
    signer_name VARCHAR(255) NOT NULL,
    signer_title VARCHAR(255),               -- e.g. "Il Presidente", "Il Segretario"
    signature_image BLOB,                    -- PNG/JPG della firma autografa
    signature_mime_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(association_id, signer_role)
);
