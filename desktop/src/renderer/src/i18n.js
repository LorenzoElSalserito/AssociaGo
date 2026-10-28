import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { setRequestLanguage, setTranslator } from './api';

import en from './locales/en.json';
import it from './locales/it.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr }
    },
    lng: 'it', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

setTranslator((key, options) => i18n.t(key, options));
setRequestLanguage(i18n.language);
// Main-process dialogs, the splash and backend responses follow the UI language.
i18n.on('languageChanged', (language) => {
  setRequestLanguage(language);
  window.api?.setLanguage?.(language)?.catch?.(() => {});
});

export default i18n;
