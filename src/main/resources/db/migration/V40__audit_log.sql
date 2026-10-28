-- Audit trail: log rows must not block deleting an association or a user, and the panel filters by association and date.
CREATE TABLE audit_log_next (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER REFERENCES associations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    description TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO audit_log_next (id, association_id, user_id, action, entity_type, entity_id, description, old_value, new_value, ip_address, created_at)
SELECT id, association_id, user_id, action, entity_type, entity_id, description, old_value, new_value, ip_address, created_at FROM audit_log;
DROP TABLE audit_log;
ALTER TABLE audit_log_next RENAME TO audit_log;
CREATE INDEX idx_audit_log_assoc_created ON audit_log(association_id, created_at);
CREATE INDEX idx_audit_log_assoc_entity ON audit_log(association_id, entity_type);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
