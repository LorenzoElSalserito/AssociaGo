-- Audit trail: log rows must not block deleting an association or a user, and the panel filters by association and date.
alter table audit_log drop foreign key fk_audit_log_association_id, drop foreign key fk_audit_log_user_id;
alter table audit_log add constraint fk_audit_log_association_id foreign key (association_id) references associations (id) on delete cascade,
 add constraint fk_audit_log_user_id foreign key (user_id) references users (id) on delete set null;
create index idx_audit_log_assoc_created on audit_log (association_id, created_at);
create index idx_audit_log_assoc_entity on audit_log (association_id, entity_type);
create index idx_audit_log_entity on audit_log (entity_type, entity_id);
