import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  LanguageCode,
  LanguageOption,
  I18nContextType,
} from '../i18n/types';
import {
  SUPPORTED_LANGUAGES,
  translate,
  lookupLocalizedAgro,
} from '../i18n';

const I18N_STORAGE_KEY = 'kisanai_preferred_language';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export function I18nProvider({
  children,
  initialLanguage,
  onLanguageChange,
}: I18nProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (initialLanguage) return initialLanguage;
    try {
      const saved = localStorage.getItem(I18N_STORAGE_KEY) as LanguageCode | null;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch (e) {}
    return 'hi'; // Default to Hindi (or English if requested)
  });

  // Sync if parent updates initialLanguage (e.g., loaded from user profile)
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  // Handle language updates
  const setLanguage = useCallback(
    (newLang: LanguageCode) => {
      setLanguageState(newLang);
      try {
        localStorage.setItem(I18N_STORAGE_KEY, newLang);
      } catch (e) {}

      // Update HTML document attributes for accessibility & font rendering
      const isUrdu = newLang === 'ur';
      document.documentElement.lang = newLang;
      document.documentElement.dir = isUrdu ? 'rtl' : 'ltr';

      if (onLanguageChange) {
        onLanguageChange(newLang);
      }
    },
    [onLanguageChange]
  );

  // Synchronize document attributes on mount and language state change
  useEffect(() => {
    const isUrdu = language === 'ur';
    document.documentElement.lang = language;
    document.documentElement.dir = isUrdu ? 'rtl' : 'ltr';
  }, [language]);

  // Fast memoized translation lookup function
  const t = useCallback(
    (key: string, variables?: Record<string, string | number>, fallback?: string): string => {
      return translate(language, key, variables, fallback);
    },
    [language]
  );

  // Domain-specific agricultural terminology helper
  const lookupAgro = useCallback(
    (category: 'crops' | 'soilTypes' | 'growthStages' | 'seasons' | 'waterSources', rawTerm: string): string => {
      return lookupLocalizedAgro(category, rawTerm, language);
    },
    [language]
  );

  const isRTL = useMemo(() => language === 'ur', [language]);

  const value = useMemo<I18nContextType>(
    () => ({
      language,
      setLanguage,
      t,
      lookupAgro,
      isRTL,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, lookupAgro, isRTL]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
