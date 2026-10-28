package com.associago.backup;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.nio.file.Path;
import java.nio.file.Files;
import java.sql.DriverManager;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BackupServiceTests {
    @TempDir Path directory;

    @Test
    void snapshotIncludesCommittedWalDataAndDoesNotOverwriteEarlierBackup() throws Exception {
        var source = new DriverManagerDataSource("jdbc:sqlite:" + directory.resolve("live.db"));
        var service = new BackupService(source, directory.toString());
        try (var connection = source.getConnection(); var statement = connection.createStatement()) {
            statement.execute("PRAGMA journal_mode=WAL");
            statement.execute("PRAGMA wal_autocheckpoint=0");
            statement.execute("CREATE TABLE records (id INTEGER PRIMARY KEY, name TEXT)");
            statement.execute("INSERT INTO records VALUES (1, 'Preserved')");
            String backup = service.createBackup();
            assertThat(Files.size(Path.of(backup))).isGreaterThan(0);
            try (var restored = DriverManager.getConnection("jdbc:sqlite:" + backup);
                 var result = restored.createStatement().executeQuery("SELECT name FROM records")) {
                assertThat(result.next()).isTrue();
                assertThat(result.getString(1)).isEqualTo("Preserved");
            }
            assertThat(service.createBackup()).isNotEqualTo(backup);
        }
    }

    @Test
    void unsupportedDatasourceDoesNotClaimSuccess() {
        var source = new DriverManagerDataSource("jdbc:h2:mem:backup-test");
        var service = new BackupService(source, directory.toString());
        assertThatThrownBy(service::createBackup).hasMessageContaining("only for SQLite");
    }
}
