-- V13__add_missing_columns_to_associations.sql

-- Check if columns exist before adding them to avoid errors on re-run or partial migrations
-- SQLite does not support IF NOT EXISTS in ALTER TABLE ADD COLUMN directly in standard SQL,
-- but Flyway handles migration versions. If this script runs, it assumes columns are missing.
-- However, if we are in a mixed state, we might need to be careful.
-- Since this is a dev environment fix, we will just add them.

-- NOTE: Some columns might already exist from V1__core_schema.sql (like email, tax_code, vat_number, etc.)
-- We should only add the ones that are definitely missing based on the error log and Association.java entity.
-- The error was: no such column: a1_0.base_membership_fee
-- And likely others that were added to the Entity but not the DB.

-- Columns already in V1: name, tax_code, vat_number, address, city, zip_code, province, email, phone, president, secretary, treasurer, logo_path, statute_path, regulation_path, is_active, created_at, updated_at, notes

-- Missing columns based on Association.java:
-- slug, password, type, vice_president, logo (BLOB vs logo_path TEXT), foundation_date, membership_number_format, base_membership_fee, use_remote_db, db_type, db_host, db_port, db_name, db_user, db_password, db_ssl, description

-- Note on 'logo': V1 has 'logo_path' (TEXT), Entity has 'logo' (byte[]).
-- If we want to store the image in DB, we need a BLOB column 'logo'.
-- If we want to keep using path, we should update Entity.
-- But the error log shows the Entity expects 'logo' column.

ALTER TABLE associations ADD COLUMN slug TEXT NOT NULL DEFAULT '';
ALTER TABLE associations ADD COLUMN password TEXT;
ALTER TABLE associations ADD COLUMN type TEXT;
ALTER TABLE associations ADD COLUMN vice_president TEXT;
ALTER TABLE associations ADD COLUMN logo BLOB;
ALTER TABLE associations ADD COLUMN foundation_date DATE;
ALTER TABLE associations ADD COLUMN membership_number_format TEXT DEFAULT 'YYYY-####';
ALTER TABLE associations ADD COLUMN base_membership_fee DECIMAL(10, 2) DEFAULT 0.0;
ALTER TABLE associations ADD COLUMN use_remote_db BOOLEAN DEFAULT 0;
ALTER TABLE associations ADD COLUMN db_type TEXT DEFAULT 'sqlite';
ALTER TABLE associations ADD COLUMN db_host TEXT;
ALTER TABLE associations ADD COLUMN db_port INTEGER;
ALTER TABLE associations ADD COLUMN db_name TEXT;
ALTER TABLE associations ADD COLUMN db_user TEXT;
ALTER TABLE associations ADD COLUMN db_password TEXT;
ALTER TABLE associations ADD COLUMN db_ssl BOOLEAN DEFAULT 0;
ALTER TABLE associations ADD COLUMN description TEXT;
