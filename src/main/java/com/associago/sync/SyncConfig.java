package com.associago.sync;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sync_config")
public class SyncConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "remote_host")
    private String remoteHost;

    @Column(name = "remote_port")
    private Integer remotePort = 3306;

    @Column(name = "remote_db_name")
    private String remoteDbName;

    @Column(name = "remote_username")
    private String remoteUsername;

    @Column(name = "remote_password")
    private String remotePassword;

    @Column(name = "last_sync_time")
    private LocalDateTime lastSyncTime;

    @Column(name = "auto_sync_enabled")
    private boolean autoSyncEnabled = false;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRemoteHost() { return remoteHost; }
    public void setRemoteHost(String remoteHost) { this.remoteHost = remoteHost; }
    public Integer getRemotePort() { return remotePort; }
    public void setRemotePort(Integer remotePort) { this.remotePort = remotePort; }
    public String getRemoteDbName() { return remoteDbName; }
    public void setRemoteDbName(String remoteDbName) { this.remoteDbName = remoteDbName; }
    public String getRemoteUsername() { return remoteUsername; }
    public void setRemoteUsername(String remoteUsername) { this.remoteUsername = remoteUsername; }
    public String getRemotePassword() { return remotePassword; }
    public void setRemotePassword(String remotePassword) { this.remotePassword = remotePassword; }
    public LocalDateTime getLastSyncTime() { return lastSyncTime; }
    public void setLastSyncTime(LocalDateTime lastSyncTime) { this.lastSyncTime = lastSyncTime; }
    public boolean isAutoSyncEnabled() { return autoSyncEnabled; }
    public void setAutoSyncEnabled(boolean autoSyncEnabled) { this.autoSyncEnabled = autoSyncEnabled; }
}
