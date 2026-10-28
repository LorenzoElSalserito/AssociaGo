-- Fields used by the volunteer shift detail and verification workflow.
ALTER TABLE volunteer_shifts ADD COLUMN description TEXT;
ALTER TABLE volunteer_shifts ADD COLUMN hourly_value DECIMAL(10, 2);
ALTER TABLE volunteer_shifts ADD COLUMN verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE volunteer_shifts ADD COLUMN verified_at DATETIME;
