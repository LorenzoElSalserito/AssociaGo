-- =============================================
-- V31: Medical Certificates for Sports Associations (ASD)
-- Tracks medical fitness certificates required for
-- members of sports associations to participate in activities.
-- =============================================

CREATE TABLE IF NOT EXISTS medical_certificates (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id       INTEGER NOT NULL,
    association_id  INTEGER NOT NULL,
    certificate_type VARCHAR(50) NOT NULL DEFAULT 'NON_AGONISTIC',  -- AGONISTIC, NON_AGONISTIC
    issue_date      DATE,
    expiry_date     DATE,
    issued_by       VARCHAR(255),       -- Doctor name
    medical_facility VARCHAR(255),      -- Hospital / clinic
    file_path       VARCHAR(500),       -- Uploaded PDF path
    status          VARCHAR(30) NOT NULL DEFAULT 'MISSING',  -- VALID, EXPIRED, EXPIRING_SOON, MISSING
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

CREATE INDEX idx_medical_cert_member ON medical_certificates(member_id);
CREATE INDEX idx_medical_cert_assoc ON medical_certificates(association_id);
CREATE INDEX idx_medical_cert_expiry ON medical_certificates(expiry_date);
CREATE INDEX idx_medical_cert_status ON medical_certificates(association_id, status);
