import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import i18n from '@/i18n';
import type { Currency, Language } from '@/lib/format';

const LANGUAGE_KEY = 'napita.language';
const CURRENCY_KEY = 'napita.currency';

type Settings = {
  language: Language;
  currency: Currency;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
};

const SettingsContext = createContext<Settings | null>(null);

/** Holds the customer's language and currency choice and remembers it on the phone. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es-CO');
  const [currency, setCurrencyState] = useState<Currency>('COP');

  useEffect(() => {
    AsyncStorage.multiGet([LANGUAGE_KEY, CURRENCY_KEY])
      .then(([[, savedLanguage], [, savedCurrency]]) => {
        if (savedLanguage === 'es-CO' || savedLanguage === 'en') {
          setLanguageState(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
        if (savedCurrency === 'COP' || savedCurrency === 'USD') setCurrencyState(savedCurrency);
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    i18n.changeLanguage(next);
    AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => {});
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    AsyncStorage.setItem(CURRENCY_KEY, next).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ language, currency, setLanguage, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const settings = useContext(SettingsContext);
  if (!settings) throw new Error('useSettings must be used inside SettingsProvider');
  return settings;
}
