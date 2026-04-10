-- Tagging transazioni per rendicontazione
ALTER TABLE transactions ADD COLUMN project_id INTEGER;
ALTER TABLE transactions ADD COLUMN fund_id INTEGER;
ALTER TABLE transactions ADD COLUMN cost_center VARCHAR(100);
