package com.associago.sync.repository;

import com.associago.sync.SyncConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncConfigRepository extends JpaRepository<SyncConfig, Long> {
}
