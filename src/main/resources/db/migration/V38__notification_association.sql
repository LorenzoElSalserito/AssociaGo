-- Scope notifications to the association that owns the bell; member is optional (guests, event-wide notices).
CREATE TABLE notifications_next (
 id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, user_id INTEGER,
 title TEXT NOT NULL, message TEXT NOT NULL, message_key TEXT, message_params TEXT,
 type TEXT NOT NULL, is_read BOOLEAN DEFAULT 0, related_entity_type TEXT, related_entity_id INTEGER,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO notifications_next (id, association_id, user_id, title, message, type, is_read,
 related_entity_type, related_entity_id, created_at)
SELECT n.id,
 CASE n.related_entity_type
  WHEN 'MEMBERSHIP' THEN (SELECT ua.association_id FROM user_associations ua WHERE ua.id = n.related_entity_id)
  WHEN 'EVENT' THEN (SELECT e.association_id FROM events e WHERE e.id = n.related_entity_id)
 END,
 n.user_id, n.title, n.message, n.type, n.is_read, n.related_entity_type, n.related_entity_id, n.created_at
FROM notifications n;
DROP TABLE notifications;
ALTER TABLE notifications_next RENAME TO notifications;
CREATE INDEX idx_notifications_association ON notifications(association_id, is_read);
