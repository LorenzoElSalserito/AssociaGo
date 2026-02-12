package com.associago.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;

@Configuration
public class DynamicDataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DynamicDataSourceConfig.class);
    private final AppConfigManager configManager;

    @Value("${associago.data.path}")
    private String dataPath;

    public DynamicDataSourceConfig(AppConfigManager configManager) {
        this.configManager = configManager;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        // Fallback if @Value is not resolved yet
        String path = dataPath;
        if (path == null) {
            path = System.getProperty("associago.data.path", System.getProperty("user.home") + "/.associago");
        }

        AppConfig config = configManager.loadConfig();

        if (!config.isConfigured()) {
            logger.info("App not configured. Starting SQLite setup database in " + path);
            new File(path).mkdirs();
            HikariConfig hikariConfig = new HikariConfig();
            hikariConfig.setDriverClassName("org.sqlite.JDBC");
            hikariConfig.setJdbcUrl("jdbc:sqlite:" + path + "/setup.db");
            return new HikariDataSource(hikariConfig);
        }

        if ("SQLITE".equalsIgnoreCase(config.getDbType())) {
            logger.info("Starting SQLite database in " + path);
            new File(path).mkdirs();
            HikariConfig hikariConfig = new HikariConfig();
            hikariConfig.setDriverClassName("org.sqlite.JDBC");
            hikariConfig.setJdbcUrl("jdbc:sqlite:" + path + "/associago.db");
            return new HikariDataSource(hikariConfig);
        } else if ("MARIADB".equalsIgnoreCase(config.getDbType())) {
            logger.info("Starting MariaDB database.");
            String url = String.format("jdbc:mariadb://%s:%s/%s", 
                    config.getDbHost(), config.getDbPort(), config.getDbName());
            HikariConfig hikariConfig = new HikariConfig();
            hikariConfig.setDriverClassName("org.mariadb.jdbc.Driver");
            hikariConfig.setJdbcUrl(url);
            hikariConfig.setUsername(config.getDbUser());
            hikariConfig.setPassword(config.getDbPassword());
            return new HikariDataSource(hikariConfig);
        }

        throw new IllegalStateException("Unknown DB Type: " + config.getDbType());
    }
}
