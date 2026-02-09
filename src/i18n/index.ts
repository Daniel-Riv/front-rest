import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import es from './locales/es';
import en from './locales/en';

export type Locale = 'es' | 'en';

const i18n = new I18n({ es, en });

// Detectar idioma del dispositivo
const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'es';
const isSpanish = deviceLocale.startsWith('es');
i18n.locale = isSpanish ? 'es' : 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'es';

export function setLocale(locale: Locale) {
  i18n.locale = locale;
}

export function getLocale(): Locale {
  const locale = i18n.locale as string;
  return locale.startsWith('es') ? 'es' : 'en';
}

export function t(scope: string, options?: object): string {
  return i18n.t(scope, options);
}

export default i18n;
