import { create } from 'zustand';
import i18n, { type Locale } from '@/i18n';

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: (i18n.locale as string).startsWith('es') ? 'es' : 'en',
  setLocale: (locale) => {
    i18n.locale = locale;
    set({ locale });
  },
}));
