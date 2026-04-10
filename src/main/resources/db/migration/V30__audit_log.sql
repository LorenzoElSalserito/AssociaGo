-- Audit log per tracciabilità operazioni sensibili (PRD v4 §P10)
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER REFERENCES associations(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,               -- CREATE, UPDATE, DELETE, EXPORT, APPROVE, SIGN, LOGIN
    entity_type VARCHAR(100) NOT NULL,          -- e.g. Member, Transaction, Assembly, Certificate
    entity_id INTEGER,
    description TEXT,
    old_value TEXT,                             -- JSON snapshot prima della modifica
    new_value TEXT,                             -- JSON snapshot dopo la modifica
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_association ON audit_log(association_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
