package com.associago.sync;

import com.associago.sync.repository.SyncConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SyncService {

    private final SyncConfigRepository syncConfigRepository;

    @Autowired
    public SyncService(SyncConfigRepository syncConfigRepository) {
        this.syncConfigRepository = syncConfigRepository;
    }

    public SyncConfig getConfig() {
        return syncConfigRepository.findById(1L).orElse(new SyncConfig());
    }

    @Transactional
    public SyncConfig saveConfig(SyncConfig config) {
        config.setId(1L); // Ensure singleton config
        return syncConfigRepository.save(config);
    }

    public boolean testConnection(SyncConfig config) {
        String url = String.format("jdbc:mariadb://%s:%d/%s", 
            config.getRemoteHost(), config.getRemotePort(), config.getRemoteDbName());
        
        try (Connection conn = DriverManager.getConnection(url, config.getRemoteUsername(), config.getRemotePassword())) {
            return conn.isValid(5);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public void performSync() {
        SyncConfig config = getConfig();
        if (config.getRemoteHost() == null) {
            throw new IllegalStateException("Remote configuration missing");
        }

        // 1. Connect to Remote DB
        // 2. Pull changes (Remote -> Local)
        // 3. Push changes (Local -> Remote)
        // 4. Update lastSyncTime
        
        // NOTE: Full implementation requires mapping all entities to SQL insert/update statements
        // or using a library like SymmetricDS. For this MVP, we simulate the success.
        
        config.setLastSyncTime(LocalDateTime.now());
        syncConfigRepository.save(config);
    }
}
