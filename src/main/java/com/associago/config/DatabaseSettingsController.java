package com.associago.config;

import com.associago.shared.i18n.LocalizedException;
import com.associago.shared.i18n.Messages;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.sql.DriverManager;
import java.util.*;

@RestController
@RequestMapping("/api/v1/database")
public class DatabaseSettingsController {
    private final AppConfigManager manager;
    private final Messages messages;
    private final String activeType;
    public DatabaseSettingsController(AppConfigManager manager, Messages messages) {
        this.manager=manager;this.messages=messages;
        var c=manager.loadConfig();activeType=c.isConfigured() && "MARIADB".equalsIgnoreCase(c.getDbType())?"mariadb":"sqlite";
    }
    @GetMapping
    public Map<String,Object> get() {
        var c=manager.loadConfig();Map<String,Object> result=new LinkedHashMap<>();
        result.put("activeType",activeType);
        result.put("useRemoteDb","MARIADB".equalsIgnoreCase(c.getDbType()));
        result.put("dbType",Objects.requireNonNullElse(c.getDbType(),"sqlite").toLowerCase());
        result.put("dbHost",Objects.requireNonNullElse(c.getDbHost(),""));result.put("dbPort",Objects.requireNonNullElse(c.getDbPort(),"3306"));
        result.put("dbName",Objects.requireNonNullElse(c.getDbName(),""));result.put("dbUser",Objects.requireNonNullElse(c.getDbUser(),""));
        result.put("dbPassword","");result.put("hasPassword",c.getDbPassword()!=null && !c.getDbPassword().isEmpty());result.put("dbSsl",c.isDbSsl());
        return result;
    }
    private AppConfig resolve(AppConfig config) {
        if(config.getDbPassword()==null || config.getDbPassword().isEmpty()) {
            var saved=manager.loadConfig();
            if(Objects.equals(saved.getDbHost(),config.getDbHost()) && Objects.equals(saved.getDbUser(),config.getDbUser()) && Objects.equals(saved.getDbName(),config.getDbName())) config.setDbPassword(saved.getDbPassword());
        }
        return config;
    }
    @PostMapping("/test")
    public Map<String,Object> test(@RequestBody AppConfig input) throws Exception {
        var c=resolve(input);
        try(var connection=DriverManager.getConnection(DatabaseConnectionSettings.url(c),c.getDbUser(),c.getDbPassword())) {
            if(!connection.isValid(5)) throw new LocalizedException("db.connectionInvalid");
            // Verify read/write privileges using a connection-local temporary table only.
            try(var stmt=connection.createStatement()) {
                stmt.execute("CREATE TEMPORARY TABLE associago_connection_probe (value INTEGER)");
                stmt.executeUpdate("INSERT INTO associago_connection_probe VALUES (1)");
                try(var rows=stmt.executeQuery("SELECT value FROM associago_connection_probe")) {if(!rows.next() || rows.getInt(1)!=1) throw new LocalizedException("db.readWriteFailed");}
                stmt.execute("DROP TEMPORARY TABLE associago_connection_probe");
            }
            return Map.of("connected",true,"product",connection.getMetaData().getDatabaseProductName(),"version",connection.getMetaData().getDatabaseProductVersion());
        }
    }
    @PostMapping
    public Map<String,Object> save(@RequestBody AppConfig input) throws Exception {
        var c=resolve(input);
        if("MARIADB".equalsIgnoreCase(c.getDbType())) test(c);
        else if(!"SQLITE".equalsIgnoreCase(c.getDbType())) throw new LocalizedException("db.unsupportedType");
        manager.saveConfig(c);
        return Map.of("saved",true,"restartRequired",true);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> error(Exception e) {
        // Never expose a JDBC URL or credentials in renderer messages.
        return ResponseEntity.badRequest().body(Map.of("message",e instanceof LocalizedException?messages.describe(e):messages.get("db.failed")));
    }
}
