package com.associago.csvimport;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImportLogRepository extends JpaRepository<ImportLog, Long> {
    List<ImportLog> findByAssociationIdOrderByCreatedAtDesc(Long associationId);
}
