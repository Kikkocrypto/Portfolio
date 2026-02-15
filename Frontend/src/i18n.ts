import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  it: { translation: it },
  en: { translation: en },
  es: { translation: es },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    supportedLngs: ['it', 'en', 'es'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// In sviluppo: dalla console puoi usare window.i18n.changeLanguage('es') per cambiare lingua subito
if (typeof window !== 'undefined') {
  (window as unknown as { i18n: typeof i18n }).i18n = i18n;
}

export default i18n;
