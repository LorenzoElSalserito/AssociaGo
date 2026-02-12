-- Join table per Coupon <-> Activity (ManyToMany già nel codice Java)
CREATE TABLE IF NOT EXISTS coupon_activities (
    coupon_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    PRIMARY KEY (coupon_id, activity_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Join table per Coupon <-> Event (nuova relazione)
CREATE TABLE IF NOT EXISTS coupon_events (
    coupon_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    PRIMARY KEY (coupon_id, event_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Colonna min_amount mancante in coupons
ALTER TABLE coupons ADD COLUMN min_amount DECIMAL(10,2) DEFAULT 0.00;
