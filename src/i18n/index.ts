import { LanguageCode, LanguageOption } from './types';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { ml } from './locales/ml';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { kn } from './locales/kn';
import { gu } from './locales/gu';
import { pa } from './locales/pa';
import { bn } from './locales/bn';
import { or } from './locales/or';
import { as } from './locales/as';
import { ur } from './locales/ur';

export * from './types';
export * from './agroDictionary';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', label: 'English', nativeLabel: 'English', isRTL: false, dir: 'ltr', speechLangCode: 'en-IN', speechLocale: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', label: 'Hindi', nativeLabel: 'हिन्दी', isRTL: false, dir: 'ltr', speechLangCode: 'hi-IN', speechLocale: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', label: 'Marathi', nativeLabel: 'मराठी', isRTL: false, dir: 'ltr', speechLangCode: 'mr-IN', speechLocale: 'mr-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', label: 'Malayalam', nativeLabel: 'മലയാളം', isRTL: false, dir: 'ltr', speechLangCode: 'ml-IN', speechLocale: 'ml-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', label: 'Tamil', nativeLabel: 'தமிழ்', isRTL: false, dir: 'ltr', speechLangCode: 'ta-IN', speechLocale: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', label: 'Telugu', nativeLabel: 'తెలుగు', isRTL: false, dir: 'ltr', speechLangCode: 'te-IN', speechLocale: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', isRTL: false, dir: 'ltr', speechLangCode: 'kn-IN', speechLocale: 'kn-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', label: 'Gujarati', nativeLabel: 'ગુજરાતી', isRTL: false, dir: 'ltr', speechLangCode: 'gu-IN', speechLocale: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', isRTL: false, dir: 'ltr', speechLangCode: 'pa-IN', speechLocale: 'pa-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', label: 'Bengali', nativeLabel: 'বাংলা', isRTL: false, dir: 'ltr', speechLangCode: 'bn-IN', speechLocale: 'bn-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', isRTL: false, dir: 'ltr', speechLangCode: 'or-IN', speechLocale: 'or-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', label: 'Assamese', nativeLabel: 'অসমীয়া', isRTL: false, dir: 'ltr', speechLangCode: 'as-IN', speechLocale: 'as-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', label: 'Urdu', nativeLabel: 'اردو', isRTL: true, dir: 'rtl', speechLangCode: 'ur-IN', speechLocale: 'ur-IN' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  mr,
  ml,
  ta,
  te,
  kn,
  gu,
  pa,
  bn,
  or,
  as,
  ur,
};

/**
 * Helper to interpolate dynamic variables like {name}, {count}, {diff}, etc.
 */
export function translate(
  lang: LanguageCode,
  key: string,
  variables?: Record<string, string | number>,
  fallback?: string
): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  let text = dict[key] || TRANSLATIONS['en'][key] || fallback || key;

  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return text;
}
