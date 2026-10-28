-- Scope notifications to the association that owns the bell; member is optional (guests, event-wide notices).
alter table notifications add column association_id bigint, add column message_key varchar(255), add column message_params TEXT, modify column user_id bigint null;
update notifications set association_id = (select ua.association_id from user_associations ua where ua.id = notifications.related_entity_id) where related_entity_type = 'MEMBERSHIP';
update notifications set association_id = (select e.association_id from events e where e.id = notifications.related_entity_id) where related_entity_type = 'EVENT';
create index idx_notifications_association on notifications (association_id, is_read);
