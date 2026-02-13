-- V18: Fix assembly_participants table schema to match JPA Entity
-- Adding missing columns that caused SQL errors (e.g., "no such column: ap1_0.notes")

-- check_out_time was already added in V16, so we skip it here to avoid duplicate column error.

ALTER TABLE assembly_participants ADD COLUMN user_association_id INTEGER;
ALTER TABLE assembly_participants ADD COLUMN participation_type TEXT;
-- ALTER TABLE assembly_participants ADD COLUMN check_out_time DATETIME; -- Already in V16
ALTER TABLE assembly_participants ADD COLUMN role TEXT;
ALTER TABLE assembly_participants ADD COLUMN notes TEXT;
ALTER TABLE assembly_participants ADD COLUMN proxy_receiver_id INTEGER;

-- Data migration (best effort for development env)
-- Map existing member_id to user_association_id
UPDATE assembly_participants SET user_association_id = member_id WHERE user_association_id IS NULL;

-- Map existing is_present to participation_type
UPDATE assembly_participants SET participation_type = 'PRESENT' WHERE is_present = 1 AND participation_type IS NULL;
UPDATE assembly_participants SET participation_type = 'ABSENT' WHERE is_present = 0 AND participation_type IS NULL;

-- Map existing proxy_member_id to proxy_receiver_id
UPDATE assembly_participants SET proxy_receiver_id = proxy_member_id WHERE proxy_receiver_id IS NULL;
