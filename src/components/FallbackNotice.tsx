import { useTranslations } from '@/i18n/ui';

/** Shown on /ml/* pages that don't have real Malayalam copy yet (see translatedPaths in src/i18n/ui.ts). */
export function FallbackNotice() {
  const t = useTranslations('ml');
  return (
    <div className="border-b border-line bg-sky" lang="ml">
      <p className="container-kilf py-3 text-sm text-navy">{t('fallback.notice')}</p>
    </div>
  );
}
