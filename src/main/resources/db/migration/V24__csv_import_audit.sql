-- V24__csv_import_audit.sql
-- Audit trail for CSV batch imports

CREATE TABLE IF NOT EXISTS import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL, -- 'MEMBER', 'ACTIVITY_PARTICIPANT', 'EVENT_PARTICIPANT'
    file_name TEXT,
    file_checksum TEXT, -- SHA-256 of uploaded file
    total_rows INTEGER DEFAULT 0,
    imported_rows INTEGER DEFAULT 0,
    skipped_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    errors_detail TEXT, -- JSON: [{"row": 3, "field": "email", "error": "invalid format"}]
    imported_by INTEGER,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PREVIEW', 'CONFIRMED', 'COMPLETED', 'FAILED'
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE SET NULL
);
