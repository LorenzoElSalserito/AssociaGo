-- Permit current membership-based writes while retaining every legacy member reference.
CREATE TABLE assembly_participants_next (
 id INTEGER PRIMARY KEY AUTOINCREMENT, assembly_id INTEGER NOT NULL,
 member_id INTEGER, is_present BOOLEAN DEFAULT 0, proxy_member_id INTEGER,
 check_in_time DATETIME, check_out_time DATETIME, user_association_id INTEGER,
 participation_type TEXT, role TEXT, notes TEXT, proxy_receiver_id INTEGER,
 FOREIGN KEY(assembly_id) REFERENCES assemblies(id) ON DELETE CASCADE,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
 FOREIGN KEY(proxy_member_id) REFERENCES members(id) ON DELETE SET NULL
);
INSERT INTO assembly_participants_next SELECT id, assembly_id, member_id, is_present, proxy_member_id,
 check_in_time, check_out_time, user_association_id, participation_type, role, notes, proxy_receiver_id
 FROM assembly_participants;
DROP TABLE assembly_participants;
ALTER TABLE assembly_participants_next RENAME TO assembly_participants;

CREATE TABLE inventory_loans_next (
 id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL, member_id INTEGER,
 loan_date DATETIME NOT NULL, expected_return_date DATETIME, actual_return_date DATETIME,
 notes TEXT, status TEXT DEFAULT 'ACTIVE', condition_on_loan TEXT, condition_on_return TEXT,
 user_association_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
 FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);
INSERT INTO inventory_loans_next SELECT id, item_id, member_id, loan_date, expected_return_date,
 actual_return_date, notes, status, condition_on_loan, condition_on_return, user_association_id, created_at, updated_at
 FROM inventory_loans;
DROP TABLE inventory_loans;
ALTER TABLE inventory_loans_next RENAME TO inventory_loans;
