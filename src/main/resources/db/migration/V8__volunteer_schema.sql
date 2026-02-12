CREATE TABLE volunteers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    skills TEXT, -- Competenze separate da virgola
    availability TEXT, -- Disponibilità (es. 'WEEKENDS', 'EVENINGS')
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE volunteer_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    volunteer_id INTEGER NOT NULL,
    event_id INTEGER, -- Opzionale, se legato a un evento
    activity_id INTEGER, -- Opzionale, se legato a un'attività
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    role TEXT, -- Ruolo svolto durante il turno
    hours_worked DECIMAL(5, 2),
    status TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'MISSED'
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
);
