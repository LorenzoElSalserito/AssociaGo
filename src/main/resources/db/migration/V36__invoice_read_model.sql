-- Keep original invoice columns and payment foreign keys intact.
-- The fiscal checks read the current Invoice model, including historical invoices.
ALTER TABLE invoices ADD COLUMN user_association_id INTEGER REFERENCES user_associations(id);
ALTER TABLE invoices ADD COLUMN type TEXT DEFAULT 'OTHER';
ALTER TABLE invoices ADD COLUMN event_id INTEGER;
ALTER TABLE invoices ADD COLUMN activity_id INTEGER;
ALTER TABLE invoices ADD COLUMN description TEXT;
ALTER TABLE invoices ADD COLUMN amount DECIMAL(10, 2);
ALTER TABLE invoices ADD COLUMN issue_date DATE;
ALTER TABLE invoices ADD COLUMN is_paid BOOLEAN DEFAULT 0;
ALTER TABLE invoices ADD COLUMN payment_date DATE;
ALTER TABLE invoices ADD COLUMN file_path TEXT;
ALTER TABLE invoices ADD COLUMN is_cancelled BOOLEAN DEFAULT 0;
ALTER TABLE invoices ADD COLUMN cancellation_reason TEXT;
UPDATE invoices SET amount = total_amount, issue_date = date, file_path = pdf_path,
    description = recipient_name, is_paid = CASE WHEN status = 'PAID' THEN 1 ELSE 0 END,
    is_cancelled = CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END;
