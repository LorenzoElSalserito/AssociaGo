package com.associago.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class AppConfigManager {
    private static final Logger logger = LoggerFactory.getLogger(AppConfigManager.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${associago.data.path}")
    private String dataPath;

    private String getConfigFilePath() {
        return dataPath + "/config.json";
    }

    public AppConfig loadConfig() {
        // If dataPath is not injected yet (e.g. during early startup), fallback to system property
        String path = dataPath;
        if (path == null) {
            path = System.getProperty("associago.data.path", System.getProperty("user.home") + "/.associago");
        }
        
        File file = new File(path + "/config.json");
        if (!file.exists()) {
            return new AppConfig(); // Not configured
        }
        try {
            return objectMapper.readValue(file, AppConfig.class);
        } catch (IOException e) {
            logger.error("Failed to load config", e);
            return new AppConfig();
        }
    }

    public void saveConfig(AppConfig config) throws IOException {
        Path path = Paths.get(dataPath);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        config.setConfigured(true);
        objectMapper.writeValue(new File(getConfigFilePath()), config);
    }
}
