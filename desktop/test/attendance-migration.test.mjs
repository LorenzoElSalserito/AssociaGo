import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// SQLite migration is checked against a populated legacy schema, including IDs and notes.
const migration = fileURLToPath(new URL('../../src/main/resources/db/migration/V33__attendance_user_records.sql', import.meta.url));
execFileSync('python3', ['-c', `
import sqlite3, pathlib, sys
c = sqlite3.connect(':memory:')
c.executescript('''
PRAGMA foreign_keys=ON;
CREATE TABLE attendance_sessions(id INTEGER PRIMARY KEY);
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE users(id INTEGER PRIMARY KEY);
INSERT INTO attendance_sessions VALUES (1);
INSERT INTO members VALUES (7);
INSERT INTO users VALUES (9);
CREATE TABLE attendance_records(id INTEGER PRIMARY KEY, session_id INTEGER NOT NULL, member_id INTEGER NOT NULL, status TEXT, check_in_time TIME, notes TEXT);
INSERT INTO attendance_records VALUES(12,1,7,'PRESENT','10:00','Preservare');
''')
c.executescript(pathlib.Path(sys.argv[1]).read_text())
assert c.execute('SELECT id, member_id, user_id, notes FROM attendance_records').fetchone() == (12,7,None,'Preservare')
c.execute("INSERT INTO attendance_records(session_id,user_id,status) VALUES(1,9,'ABSENT')")
assert c.execute('PRAGMA foreign_key_check').fetchall() == []
try:
 c.execute("INSERT INTO attendance_records(session_id,user_id,status) VALUES(1,9,'PRESENT')")
 raise AssertionError('Duplicate attendance accepted')
except sqlite3.IntegrityError:
 pass
`, migration]);
