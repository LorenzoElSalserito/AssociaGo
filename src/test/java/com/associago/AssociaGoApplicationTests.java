package com.associago;

import java.io.File;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AssociaGoApplicationTests {

    static {
        // Mirror what AssociaGoApplication.main() does: the application config
        // resolves ${associago.data.path}, so without this property Spring fails
        // to load the context. Use a unique temp dir per test run so that
        // Flyway migrations always start from a clean SQLite database.
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(
                System.getProperty("java.io.tmpdir"),
                "associago-test-" + UUID.randomUUID()
            );
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Test
    void contextLoads() {
    }

}
