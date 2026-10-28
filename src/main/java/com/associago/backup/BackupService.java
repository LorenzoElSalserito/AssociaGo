package com.associago.backup;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class BackupService {
    private final DataSource dataSource;
    private final Path backupDirectory;

    public BackupService(DataSource dataSource, @Value("${associago.data.path}") String dataPath) {
        this.dataSource = dataSource;
        this.backupDirectory = Path.of(dataPath).resolve("backups");
    }

    /** Creates a consistent SQLite snapshot, including committed WAL transactions. */
    public String createBackup() throws IOException {
        Files.createDirectories(backupDirectory);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        Path target = backupDirectory.resolve("associago_backup_" + timestamp + "_" + UUID.randomUUID() + ".db")
                .toAbsolutePath();
        try (Connection connection = dataSource.getConnection()) {
            if (connection.getMetaData().getURL().startsWith("jdbc:mariadb:")) {
                return createMariaDbSnapshot(connection, target.resolveSibling(target.getFileName().toString().replace(".db", ".json")));
            }
            if (!connection.getMetaData().getURL().startsWith("jdbc:sqlite:")) {
                throw new IOException("Local backup is available only for SQLite databases.");
            }
            // VACUUM INTO uses the live connection rather than copying a possibly stale DB file.
            try (var statement = connection.prepareStatement("VACUUM INTO ?")) {
                statement.setString(1, target.toString());
                statement.execute();
            }
            return target.toString();
        } catch (SQLException exception) {
            Files.deleteIfExists(target);
            throw new IOException("Unable to create a consistent database backup.", exception);
        }
    }

    /** Consistent logical database snapshot; external asset files are not included. */
    private String createMariaDbSnapshot(Connection connection, Path target) throws IOException, SQLException {
        try {
            connection.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
            connection.setAutoCommit(false);
            connection.setReadOnly(true);
            try (var statement = connection.createStatement()) { statement.execute("START TRANSACTION WITH CONSISTENT SNAPSHOT"); }
            try (var json = new com.fasterxml.jackson.core.JsonFactory().createGenerator(target.toFile(), com.fasterxml.jackson.core.JsonEncoding.UTF8)) {
                json.writeStartObject(); json.writeNumberField("formatVersion",1); json.writeStringField("database","MariaDB");
                json.writeStringField("createdAt",LocalDateTime.now().toString()); json.writeArrayFieldStart("tables");
                var names = new java.util.ArrayList<String>();
                try (var tables = connection.getMetaData().getTables(connection.getCatalog(),null,"%",new String[]{"TABLE"})) {
                    while(tables.next()) names.add(tables.getString("TABLE_NAME"));
                }
                java.util.Collections.sort(names);
                for(String name:names) {
                    json.writeStartObject(); json.writeStringField("name",name);
                    try(var statement=connection.createStatement();var rows=statement.executeQuery("SELECT * FROM `"+name.replace("`","``")+"`")) {
                        var metadata=rows.getMetaData(); json.writeArrayFieldStart("columns");
                        for(int i=1;i<=metadata.getColumnCount();i++) {json.writeStartObject();json.writeStringField("name",metadata.getColumnName(i));json.writeNumberField("jdbcType",metadata.getColumnType(i));json.writeEndObject();}
                        json.writeEndArray();json.writeArrayFieldStart("rows");
                        while(rows.next()) {
                            json.writeStartArray();
                            for(int i=1;i<=metadata.getColumnCount();i++) {
                                int type=metadata.getColumnType(i);
                                if(type==java.sql.Types.BINARY || type==java.sql.Types.VARBINARY || type==java.sql.Types.LONGVARBINARY || type==java.sql.Types.BLOB) {
                                    byte[] value=rows.getBytes(i);if(value==null)json.writeNull();else json.writeBinary(value);
                                } else {String value=rows.getString(i);if(value==null)json.writeNull();else json.writeString(value);}
                            }
                            json.writeEndArray();
                        }
                        json.writeEndArray();
                    }
                    json.writeEndObject();
                }
                json.writeEndArray();json.writeEndObject();
            }
            connection.rollback();
            return target.toString();
        } catch(IOException | SQLException error) {
            connection.rollback();Files.deleteIfExists(target);throw error;
        }
    }
}
