-- Align the persisted motion schema with the existing AssemblyMotion entity.
-- Preserve historical vote counts and decisions from the original V6 columns.
ALTER TABLE assembly_motions ADD COLUMN order_number INTEGER;
ALTER TABLE assembly_motions ADD COLUMN voting_type TEXT DEFAULT 'SIMPLE';
ALTER TABLE assembly_motions ADD COLUMN is_planned BOOLEAN DEFAULT 1;
ALTER TABLE assembly_motions ADD COLUMN decision_taken TEXT;
ALTER TABLE assembly_motions ADD COLUMN decision_summary TEXT;
ALTER TABLE assembly_motions ADD COLUMN votes_in_favor INTEGER DEFAULT 0;
ALTER TABLE assembly_motions ADD COLUMN valid_votes INTEGER DEFAULT 0;
ALTER TABLE assembly_motions ADD COLUMN is_approved BOOLEAN DEFAULT 0;
ALTER TABLE assembly_motions ADD COLUMN notes TEXT;
ALTER TABLE assembly_motions ADD COLUMN created_at DATETIME;
ALTER TABLE assembly_motions ADD COLUMN updated_at DATETIME;
UPDATE assembly_motions SET
    votes_in_favor = COALESCE(votes_for, 0),
    valid_votes = COALESCE(votes_for, 0) + COALESCE(votes_against, 0) + COALESCE(votes_abstain, 0),
    decision_taken = result,
    is_approved = CASE WHEN result = 'APPROVED' THEN 1 ELSE 0 END,
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
