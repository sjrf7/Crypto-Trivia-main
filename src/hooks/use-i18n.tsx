
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import es from '@/lib/i18n/es.json';
import en from '@/lib/i18n/en.json';

const translations: { [key: string]: any } = { es, en };

type Language = 'es' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }, options?: { returnObjects: boolean }) => any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Set language from localStorage or browser settings on initial load
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && ['es', 'en'].includes(storedLang)) {
      setLanguageState(storedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      setLanguageState(browserLang === 'es' ? 'es' : 'en');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }, options?: { returnObjects: boolean }): any => {
    const keys = key.split('.');
    
    const findTranslation = (lang: Language, keyParts: string[]) => {
        let result = translations[lang];
        for (const k of keyParts) {
            result = result?.[k];
            if (result === undefined) return undefined;
        }
        return result;
    }

    let translation = findTranslation(language, keys);

    if (translation === undefined) {
        translation = findTranslation('en', keys);
    }
    
    if (translation === undefined) {
        return key;
    }

    if (options?.returnObjects) {
        return translation;
    }

    if (typeof translation !== 'string') {
        console.warn(`Translation for key '${key}' is not a string. Did you mean to use returnObjects?`);
        return key;
    }

    if (replacements) {
        return Object.keys(replacements).reduce((acc, currentKey) => {
            const regex = new RegExp(`{${currentKey}}`, 'g');
            return acc.replace(regex, String(replacements[currentKey]));
        }, translation);
    }

    return translation;

  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
