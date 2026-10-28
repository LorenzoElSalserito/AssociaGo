package com.associago.shared.i18n;

import java.io.File;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** API messages shown in the UI follow the Accept-Language header sent by the renderer. */
@SpringBootTest
@AutoConfigureMockMvc
class AcceptLanguageEndToEndTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void databaseValidationMessageFollowsAcceptLanguage() throws Exception {
        mockMvc.perform(invalidHost().header("Accept-Language", "en-US,en;q=0.9"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid database host."));
        mockMvc.perform(invalidHost().header("Accept-Language", "de"))
                .andExpect(jsonPath("$.message").value("Ungültiger Datenbank-Host."));
        mockMvc.perform(invalidHost().header("Accept-Language", "pt-BR"))
                .andExpect(jsonPath("$.message").value("Host database non valido."));
        mockMvc.perform(invalidHost())
                .andExpect(jsonPath("$.message").value("Host database non valido."));
    }

    private static MockHttpServletRequestBuilder invalidHost() {
        return post("/api/v1/database/test")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dbType\":\"MARIADB\",\"dbHost\":\"bad host!\",\"dbPort\":\"3306\",\"dbName\":\"associago\",\"dbUser\":\"user\"}");
    }
}
