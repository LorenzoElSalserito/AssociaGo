-- =============================================
-- V32: Federation Support for Sports Associations
-- Adds fields for tracking registration with
-- national/European sports federation bodies (CONI, EOC).
-- =============================================

ALTER TABLE associations ADD COLUMN federation_registration_number VARCHAR(100);
ALTER TABLE associations ADD COLUMN federation_provider VARCHAR(50);
ALTER TABLE associations ADD COLUMN federation_registered_at TIMESTAMP;
