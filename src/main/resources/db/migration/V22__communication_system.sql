-- V22__communication_system.sql
-- Institutional communications: templates, campaigns, sending log

CREATE TABLE IF NOT EXISTS communication_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    merge_fields TEXT, -- JSON array of available merge fields e.g. ["{{name}}", "{{email}}"]
    category TEXT DEFAULT 'GENERAL', -- 'GENERAL', 'RENEWAL', 'EVENT', 'ACTIVITY', 'ASSEMBLY', 'FISCAL'
    language TEXT DEFAULT 'it',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id INTEGER NOT NULL,
    template_id INTEGER,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    sender_email TEXT,
    sender_name TEXT,
    channel TEXT DEFAULT 'EMAIL', -- 'EMAIL', 'PEC'
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'
    scheduled_at DATETIME,
    sent_at DATETIME,
    sent_by INTEGER,
    segment_filter TEXT, -- JSON: {"roles": ["MEMBER"], "status": ["ACTIVE"], "tags": []}
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES communication_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS communication_recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    communication_id INTEGER NOT NULL,
    user_id INTEGER,
    email TEXT NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'
    sent_at DATETIME,
    error_message TEXT,
    FOREIGN KEY (communication_id) REFERENCES communications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
