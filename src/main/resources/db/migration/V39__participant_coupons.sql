-- Coupons applied at registration: the coupon, its discount and the amount due are kept on the participant.
ALTER TABLE activity_participants ADD COLUMN coupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL;
ALTER TABLE activity_participants ADD COLUMN amount_due DECIMAL(10, 2);

ALTER TABLE event_participants ADD COLUMN coupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL;
ALTER TABLE event_participants ADD COLUMN coupon_code TEXT;
ALTER TABLE event_participants ADD COLUMN original_amount DECIMAL(10, 2);
ALTER TABLE event_participants ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE event_participants ADD COLUMN amount_due DECIMAL(10, 2);
