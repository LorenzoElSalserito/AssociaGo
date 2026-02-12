CREATE TABLE assemblies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location TEXT,
    type TEXT NOT NULL, -- 'ORDINARY', 'EXTRAORDINARY'
    status TEXT NOT NULL, -- 'DRAFT', 'CALLED', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'
    first_call_quorum REAL,
    second_call_quorum REAL,
    minutes TEXT, -- Verbale
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assembly_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assembly_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    is_present BOOLEAN DEFAULT 0,
    proxy_member_id INTEGER, -- ID del socio delegato
    check_in_time DATETIME,
    FOREIGN KEY (assembly_id) REFERENCES assemblies(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (proxy_member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE assembly_motions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assembly_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    result TEXT, -- 'APPROVED', 'REJECTED'
    FOREIGN KEY (assembly_id) REFERENCES assemblies(id) ON DELETE CASCADE
);
