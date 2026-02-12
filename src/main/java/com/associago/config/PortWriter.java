package com.associago.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Component
public class PortWriter implements ApplicationListener<WebServerInitializedEvent> {

    private static final Logger logger = LoggerFactory.getLogger(PortWriter.class);

    @Value("${associago.data.path}")
    private String dataPath;

    @Override
    public void onApplicationEvent(WebServerInitializedEvent event) {
        int port = event.getWebServer().getPort();
        logger.info("AssociaGo started on port: {}", port);
        writePortToJson(port);
    }

    private void writePortToJson(int port) {
        String configFilePath = dataPath + "/config/connection.json";
        try {
            Path path = Paths.get(configFilePath);
            // Ensure parent directories exist
            if (path.getParent() != null) {
                Files.createDirectories(path.getParent());
            }

            Map<String, Object> config = new HashMap<>();
            config.put("port", port);
            config.put("host", "localhost");
            config.put("protocol", "http");

            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(path.toFile(), config);

            logger.info("Connection config written to {}", configFilePath);
        } catch (IOException e) {
            logger.error("Failed to write connection config to file: {}", configFilePath, e);
        }
    }
}
