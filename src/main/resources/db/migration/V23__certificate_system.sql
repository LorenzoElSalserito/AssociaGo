-- V23__certificate_system.sql
-- Certificate/attestation templates and issued certificates

CREATE TABLE IF NOT EXISTS certificate_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'PARTICIPATION', 'ATTENDANCE', 'TRAINING', 'MEMBERSHIP', 'CUSTOM'
    body_html TEXT NOT NULL,
    merge_fields TEXT, -- JSON: available placeholders
    header_image_path TEXT,
    footer_image_path TEXT,
    background_image_path TEXT,
    signatory_roles TEXT, -- JSON array: ["PRESIDENT", "SECRETARY"]
    orientation TEXT DEFAULT 'LANDSCAPE', -- 'LANDSCAPE', 'PORTRAIT'
    paper_size TEXT DEFAULT 'A4',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS issued_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    event_id INTEGER,
    activity_id INTEGER,
    certificate_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    issued_by INTEGER,
    title TEXT NOT NULL,
    body_snapshot TEXT, -- Rendered HTML at generation time
    signatories TEXT, -- JSON: [{"name": "...", "role": "PRESIDENT", "signature_path": "..."}]
    pdf_path TEXT,
    checksum TEXT, -- SHA-256 of generated PDF
    qr_code_data TEXT, -- Verification URL/data
    status TEXT DEFAULT 'ISSUED', -- 'DRAFT', 'ISSUED', 'REVOKED'
    revoked_at DATETIME,
    revoked_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(association_id, certificate_number)
);
