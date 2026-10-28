package com.associago.shared.i18n;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/** The five backend bundles must stay in sync and every message must be valid MessageFormat. */
class MessageBundleTests {

    private static final String[] LANGUAGES = {"it", "en", "de", "es", "fr"};

    @Test
    void everyKeyExistsInAllFiveBundles() throws Exception {
        Set<String> reference = load("it").stringPropertyNames();
        assertThat(reference).isNotEmpty();
        for (String language : LANGUAGES) {
            Properties bundle = load(language);
            assertThat(new TreeSet<>(bundle.stringPropertyNames()))
                    .as("keys of messages_%s.properties", language)
                    .isEqualTo(new TreeSet<>(reference));
            for (String key : bundle.stringPropertyNames()) {
                String value = bundle.getProperty(key);
                assertThat(value).as("%s in %s", key, language).isNotBlank();
                assertThatCode(() -> new MessageFormat(value, Locale.forLanguageTag(language)).format(new Object[]{"a", "b", "c"}))
                        .as("%s in %s", key, language).doesNotThrowAnyException();
                // A single apostrophe would be swallowed by MessageFormat: it must be written as ''.
                assertThat(value.replace("''", "")).as("%s in %s", key, language).doesNotContain("'");
            }
        }
    }

    @Test
    void resolvesRequestLocaleWithItalianFallback() {
        Messages messages = Messages.standalone();
        assertThat(messages.get(Locale.ITALIAN, "financial.totalIncome")).isEqualTo("Totale entrate");
        assertThat(messages.get(Locale.forLanguageTag("en-US"), "financial.totalIncome")).isEqualTo("Total income");
        assertThat(messages.get(Locale.forLanguageTag("pt-BR"), "financial.totalIncome")).isEqualTo("Totale entrate");
        assertThat(messages.get(Locale.FRENCH, "card.title")).isEqualTo("Carte d'adhérent");
        assertThat(messages.get(Locale.ENGLISH, "balance.title", 2026)).isEqualTo("Annual financial statement 2026");
        assertThat(messages.label(Locale.GERMAN, "enum.outcome", "approved")).isEqualTo("Angenommen");
        assertThat(messages.label(Locale.GERMAN, "enum.outcome", "UNKNOWN_VALUE")).isEqualTo("UNKNOWN_VALUE");
        assertThat(messages.describe(Locale.ENGLISH, new LocalizedException("transfer.columnCount", 7)))
                .isEqualTo("Wrong number of columns on row 7.");
        assertThat(messages.describe(Locale.ENGLISH, new IllegalArgumentException("MOTION_NO_VOTERS"))).isEqualTo("MOTION_NO_VOTERS");
    }

    private static Properties load(String language) throws Exception {
        Properties properties = new Properties();
        try (InputStream in = MessageBundleTests.class.getResourceAsStream("/i18n/messages_" + language + ".properties")) {
            assertThat(in).as("messages_%s.properties", language).isNotNull();
            properties.load(new InputStreamReader(in, StandardCharsets.UTF_8));
        }
        return properties;
    }
}
