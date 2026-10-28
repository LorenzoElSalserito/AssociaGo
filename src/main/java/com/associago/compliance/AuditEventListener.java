package com.associago.compliance;

import jakarta.persistence.EntityManagerFactory;
import org.hibernate.Hibernate;
import org.hibernate.action.spi.BeforeTransactionCompletionProcess;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventSource;
import org.hibernate.event.spi.EventType;
import org.hibernate.event.spi.PostDeleteEvent;
import org.hibernate.event.spi.PostDeleteEventListener;
import org.hibernate.event.spi.PostInsertEvent;
import org.hibernate.event.spi.PostInsertEventListener;
import org.hibernate.event.spi.PostUpdateEvent;
import org.hibernate.event.spi.PostUpdateEventListener;
import org.hibernate.persister.entity.EntityPersister;
import org.hibernate.type.EntityType;
import org.hibernate.type.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Records create/update/delete of audited entities without touching the business services.
 * Rows are written with plain JDBC on the same connection right before commit, so they share the
 * outcome of the business transaction, never fire entity events themselves and never make it fail.
 */
@Component
public class AuditEventListener implements PostInsertEventListener, PostUpdateEventListener, PostDeleteEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuditEventListener.class);
    private static final String INSERT = "INSERT INTO audit_log (association_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, ?)";
    private static final int SUMMARY_MAX = 1000;

    private final Map<String, Meta> metas = new ConcurrentHashMap<>();
    private final SessionFactoryImplementor factory;

    public AuditEventListener(EntityManagerFactory emf) {
        this.factory = emf.unwrap(SessionFactoryImplementor.class);
        EventListenerRegistry registry = factory.getServiceRegistry().getService(EventListenerRegistry.class);
        registry.appendListeners(EventType.POST_INSERT, this);
        registry.appendListeners(EventType.POST_UPDATE, this);
        registry.appendListeners(EventType.POST_DELETE, this);
    }

    @Override
    public void onPostInsert(PostInsertEvent event) {
        Meta meta = meta(event.getPersister());
        if (meta == null) return;
        safely(() -> enqueue(event.getSession(), meta, "CREATE", event.getId(), event.getState(), null));
    }

    @Override
    public void onPostUpdate(PostUpdateEvent event) {
        Meta meta = meta(event.getPersister());
        if (meta == null) return;
        safely(() -> {
            String summary = null;
            int[] dirty = event.getDirtyProperties();
            if (dirty == null && event.getOldState() != null) dirty = diff(event.getOldState(), event.getState());
            if (dirty != null) {
                List<String> changed = new ArrayList<>();
                boolean relevant = false;
                for (int i : dirty) {
                    if (meta.technical[i]) continue;
                    relevant = true;
                    if (!meta.sensitive[i]) changed.add(meta.names[i]);
                }
                if (!relevant) return;
                summary = changed.isEmpty() ? null : String.join(", ", changed);
            }
            enqueue(event.getSession(), meta, "UPDATE", event.getId(), event.getState(), summary);
        });
    }

    @Override
    public void onPostDelete(PostDeleteEvent event) {
        Meta meta = meta(event.getPersister());
        // Deleting an association cascades its own log away.
        if (meta == null || "Association".equals(meta.type)) return;
        safely(() -> enqueue(event.getSession(), meta, "DELETE", event.getId(), event.getDeletedState(), null));
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return false;
    }

    private void enqueue(EventSource session, Meta meta, String action, Object id, Object[] state, String summary) {
        Long entityId = id instanceof Number n ? n.longValue() : null;
        Long associationId = "Association".equals(meta.type) ? entityId : associationOf(meta, state);
        String description = summary != null && summary.length() > SUMMARY_MAX ? summary.substring(0, SUMMARY_MAX) : summary;
        Timestamp at = Timestamp.valueOf(LocalDateTime.now());
        session.getActionQueue().registerProcess((BeforeTransactionCompletionProcess) s -> {
            try {
                s.doWork(connection -> {
                    try (PreparedStatement ps = connection.prepareStatement(INSERT)) {
                        if (associationId == null) ps.setNull(1, Types.BIGINT); else ps.setLong(1, associationId);
                        ps.setString(2, action);
                        ps.setString(3, meta.type);
                        if (entityId == null) ps.setNull(4, Types.BIGINT); else ps.setLong(4, entityId);
                        if (description == null) ps.setNull(5, Types.VARCHAR); else ps.setString(5, description);
                        ps.setTimestamp(6, at);
                        ps.executeUpdate();
                    }
                });
            } catch (RuntimeException e) {
                log.warn("Audit entry not recorded for {} {} #{}: {}", action, meta.type, entityId, e.getMessage());
            }
        });
    }

    private Long associationOf(Meta meta, Object[] state) {
        if (state != null) {
            if (meta.associationIdIndex >= 0 && state[meta.associationIdIndex] instanceof Number n) return n.longValue();
            if (meta.associationIndex >= 0 && state[meta.associationIndex] != null) {
                Object id = factory.getPersistenceUnitUtil().getIdentifier(state[meta.associationIndex]);
                if (id instanceof Number n) return n.longValue();
            }
            if (meta.parentIndex >= 0) {
                Object parent = state[meta.parentIndex];
                if (parent != null && Hibernate.isInitialized(parent)
                        && meta.parentPersister.getPropertyValue(parent, "associationId") instanceof Number n) {
                    return n.longValue();
                }
            }
        }
        return requestAssociationId();
    }

    static Long requestAssociationId() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            String header = attrs.getRequest().getHeader("X-Association-Id");
            if (header != null && !header.isBlank()) {
                try {
                    return Long.valueOf(header.trim());
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private static int[] diff(Object[] oldState, Object[] state) {
        List<Integer> changed = new ArrayList<>();
        for (int i = 0; i < state.length; i++) {
            if (!Objects.deepEquals(oldState[i], state[i])) changed.add(i);
        }
        return changed.stream().mapToInt(Integer::intValue).toArray();
    }

    private void safely(Runnable action) {
        try {
            action.run();
        } catch (RuntimeException e) {
            log.warn("Audit listener failed: {}", e.getMessage());
        }
    }

    private Meta meta(EntityPersister persister) {
        Meta meta = metas.computeIfAbsent(persister.getEntityName(), name -> build(persister));
        return meta == Meta.SKIP ? null : meta;
    }

    private Meta build(EntityPersister persister) {
        String type = persister.getMappedClass().getSimpleName();
        if (AuditAreas.areaOf(type) == null) return Meta.SKIP;
        String[] names = persister.getPropertyNames();
        Type[] types = persister.getPropertyTypes();
        Meta meta = new Meta(type, names);
        for (int i = 0; i < names.length; i++) {
            meta.technical[i] = AuditAreas.isTechnical(names[i]);
            meta.sensitive[i] = AuditAreas.isSensitive(names[i], types[i].getReturnedClass());
            if ("associationId".equals(names[i])) meta.associationIdIndex = i;
            else if ("association".equals(names[i]) && types[i].isEntityType()) meta.associationIndex = i;
            else if (meta.parentIndex < 0 && types[i] instanceof EntityType et) {
                EntityPersister parent = factory.getMappingMetamodel().getEntityDescriptor(et.getAssociatedEntityName());
                if (List.of(parent.getPropertyNames()).contains("associationId")) {
                    meta.parentIndex = i;
                    meta.parentPersister = parent;
                }
            }
        }
        return meta;
    }

    private static final class Meta {
        static final Meta SKIP = new Meta("", new String[0]);
        final String type;
        final String[] names;
        final boolean[] technical;
        final boolean[] sensitive;
        int associationIdIndex = -1;
        int associationIndex = -1;
        int parentIndex = -1;
        EntityPersister parentPersister;

        Meta(String type, String[] names) {
            this.type = type;
            this.names = names;
            this.technical = new boolean[names.length];
            this.sensitive = new boolean[names.length];
        }
    }
}
