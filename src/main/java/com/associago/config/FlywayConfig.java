package com.associago.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    private final AppConfigManager configManager;

    public FlywayConfig(AppConfigManager configManager) {
        this.configManager = configManager;
    }

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        // Always run migrations to ensure schema consistency, 
        // whether in setup mode (setup.db) or configured mode.
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
    }
}
