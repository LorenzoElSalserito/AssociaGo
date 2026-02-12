package com.associago.config;

public class AppConfig {
    private String dbType; // "SQLITE" or "MARIADB"
    private String dbHost;
    private String dbPort;
    private String dbName;
    private String dbUser;
    private String dbPassword;
    private boolean isConfigured;

    // Defaults
    public AppConfig() {
        this.isConfigured = false;
    }

    public String getDbType() { return dbType; }
    public void setDbType(String dbType) { this.dbType = dbType; }
    public String getDbHost() { return dbHost; }
    public void setDbHost(String dbHost) { this.dbHost = dbHost; }
    public String getDbPort() { return dbPort; }
    public void setDbPort(String dbPort) { this.dbPort = dbPort; }
    public String getDbName() { return dbName; }
    public void setDbName(String dbName) { this.dbName = dbName; }
    public String getDbUser() { return dbUser; }
    public void setDbUser(String dbUser) { this.dbUser = dbUser; }
    public String getDbPassword() { return dbPassword; }
    public void setDbPassword(String dbPassword) { this.dbPassword = dbPassword; }
    public boolean isConfigured() { return isConfigured; }
    public void setConfigured(boolean configured) { isConfigured = configured; }
}
