-- Preserve legacy member-based records while allowing the current user registry.
CREATE TABLE attendance_records_next (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    member_id INTEGER,
    user_id INTEGER,
    status TEXT DEFAULT 'PRESENT',
    check_in_time TIME,
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK ((member_id IS NOT NULL AND user_id IS NULL) OR (member_id IS NULL AND user_id IS NOT NULL))
);
INSERT INTO attendance_records_next (id, session_id, member_id, status, check_in_time, notes)
SELECT id, session_id, member_id, status, check_in_time, notes FROM attendance_records;
DROP TABLE attendance_records;
ALTER TABLE attendance_records_next RENAME TO attendance_records;
CREATE UNIQUE INDEX idx_attendance_session_user ON attendance_records(session_id, user_id);
