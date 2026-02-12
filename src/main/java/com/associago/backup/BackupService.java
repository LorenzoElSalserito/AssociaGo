package com.associago.backup;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class BackupService {

    private static final String DB_PATH = "associago.db"; // Default SQLite path
    private static final String BACKUP_DIR = "backups";

    public String createBackup() throws IOException {
        File dbFile = new File(DB_PATH);
        if (!dbFile.exists()) {
            // Try to find it in the current directory or resource path if needed
            // For MVP, assuming it's in root
            throw new IOException("Database file not found at " + dbFile.getAbsolutePath());
        }

        Path backupDir = Paths.get(BACKUP_DIR);
        if (!Files.exists(backupDir)) {
            Files.createDirectories(backupDir);
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String backupFileName = "associago_backup_" + timestamp + ".db";
        Path backupPath = backupDir.resolve(backupFileName);

        Files.copy(dbFile.toPath(), backupPath, StandardCopyOption.REPLACE_EXISTING);
        
        return backupPath.toAbsolutePath().toString();
    }
}
