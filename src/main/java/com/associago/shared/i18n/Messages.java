package com.associago.shared.i18n;

import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Resolves user-facing text from {@code i18n/messages_*.properties} in the request locale
 * (Accept-Language, see {@link com.associago.config.I18nConfig}). Unsupported locales fall back to Italian.
 */
@Component
public class Messages {

    public static final String BASENAME = "i18n/messages";
    public static final Locale DEFAULT_LOCALE = Locale.ITALIAN;
    public static final List<Locale> SUPPORTED_LOCALES = List.of(
            Locale.ITALIAN, Locale.ENGLISH, Locale.GERMAN, Locale.forLanguageTag("es"), Locale.FRENCH);

    private final MessageSource source;

    public Messages(MessageSource source) {
        this.source = source;
    }

    /** Messages backed by the bundled properties, for code running outside Spring (tests, tools). */
    public static Messages standalone() {
        return new Messages(createMessageSource());
    }

    public static ResourceBundleMessageSource createMessageSource() {
        ResourceBundleMessageSource source = new ResourceBundleMessageSource();
        source.setBasename(BASENAME);
        source.setDefaultEncoding(StandardCharsets.UTF_8.name());
        source.setDefaultLocale(DEFAULT_LOCALE);
        source.setFallbackToSystemLocale(false);
        source.setUseCodeAsDefaultMessage(false);
        // Every message goes through MessageFormat, so apostrophes are always written as ''.
        source.setAlwaysUseMessageFormat(true);
        return source;
    }

    /** Maps any locale to one of the five supported languages (Italian when unknown). */
    public static Locale supported(Locale locale) {
        if (locale == null) return DEFAULT_LOCALE;
        return SUPPORTED_LOCALES.stream()
                .filter(l -> l.getLanguage().equals(locale.getLanguage()))
                .findFirst()
                .orElse(DEFAULT_LOCALE);
    }

    public Locale current() {
        return supported(LocaleContextHolder.getLocale());
    }

    public String get(String code, Object... args) {
        return get(current(), code, args);
    }

    public String get(Locale locale, String code, Object... args) {
        return source.getMessage(code, plain(args), supported(locale));
    }

    /** Localized label for an enum-like value ({@code prefix.VALUE}); the raw value when no label exists. */
    public String label(Locale locale, String prefix, String value) {
        if (value == null || value.isBlank()) return "";
        try {
            return source.getMessage(prefix + "." + value.trim().toUpperCase(Locale.ROOT), null, supported(locale));
        } catch (NoSuchMessageException e) {
            return value;
        }
    }

    /** User-facing text for an exception: localized for {@link LocalizedException}, its message otherwise. */
    public String describe(Locale locale, Throwable error) {
        if (error instanceof LocalizedException localized) {
            return get(locale, localized.getCode(), localized.getArgs());
        }
        return error.getMessage();
    }

    public String describe(Throwable error) {
        return describe(current(), error);
    }

    // Numbers are pre-formatted by callers: MessageFormat would group years ("2.026").
    private static Object[] plain(Object[] args) {
        if (args == null) return null;
        return Arrays.stream(args).map(a -> a instanceof Number ? String.valueOf(a) : a).toArray();
    }
}
