import { useCallback } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import i18n from '@/i18n';

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = useCallback(
    (scope: string, options?: object) => i18n.t(scope, options),
    [locale]
  );

  return { t, locale, setLocale };
}
