package com.associago.config;

import com.associago.shared.i18n.Messages;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

/** Backend text follows the renderer language, sent as Accept-Language on every request. */
@Configuration
public class I18nConfig {

    @Bean
    public MessageSource messageSource() {
        return Messages.createMessageSource();
    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(Messages.SUPPORTED_LOCALES);
        resolver.setDefaultLocale(Messages.DEFAULT_LOCALE);
        return resolver;
    }
}
