import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import esCO from './es-CO.json';

// Colombian Spanish is always the default (napita-docs/product/language-and-tone.md).
i18n.use(initReactI18next).init({
  resources: {
    'es-CO': { translation: esCO },
    en: { translation: en },
  },
  lng: 'es-CO',
  fallbackLng: 'es-CO',
  interpolation: { escapeValue: false },
});

export default i18n;
