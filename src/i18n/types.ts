import React from 'react';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'mr'
  | 'pa'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'gu'
  | 'bn'
  | 'or'
  | 'as'
  | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  label?: string;
  nativeLabel?: string;
  speechLangCode: string;
  speechLocale?: string;
  isRTL?: boolean;
  dir?: 'ltr' | 'rtl';
  script?: string;
}

export type TranslationParams = Record<string, string | number>;

export interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: TranslationParams, fallback?: string) => string;
  lookupAgro: (category: 'crops' | 'soilTypes' | 'growthStages' | 'seasons' | 'waterSources', rawTerm: string) => string;
  isRTL: boolean;
  supportedLanguages: LanguageOption[];
  currentLanguageInfo?: LanguageOption;
  formatNumber?: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  getLocalizedCrop?: (cropNameOrId: string) => string;
  getLocalizedSoil?: (soilType: string) => string;
  getLocalizedStage?: (stage: string) => string;
  getLocalizedSeason?: (season: string) => string;
}
