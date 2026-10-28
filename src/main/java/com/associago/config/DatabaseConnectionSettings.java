package com.associago.config;

import com.associago.shared.i18n.LocalizedException;

public final class DatabaseConnectionSettings {
    private DatabaseConnectionSettings() {}
    public static String url(AppConfig config) {
        String host=config.getDbHost(), name=config.getDbName();
        if(host==null || !host.matches("[a-zA-Z0-9.-]+|\\[[a-fA-F0-9:]+\\]")) throw new LocalizedException("db.invalidHost");
        if(name==null || !name.matches("[a-zA-Z0-9_]+")) throw new LocalizedException("db.invalidName");
        int port;
        try {port=Integer.parseInt(config.getDbPort());} catch(Exception e) {throw new LocalizedException("db.invalidPort");}
        if(port<1 || port>65535) throw new LocalizedException("db.invalidPort");
        if(config.getDbUser()==null || config.getDbUser().isBlank()) throw new LocalizedException("db.userRequired");
        return "jdbc:mariadb://"+host+":"+port+"/"+name+"?connectTimeout=5000&socketTimeout=30000&sslMode="+(config.isDbSsl()?"verify-full":"disable");
    }
}
