import { useTranslation } from 'react-i18next';

import {
  formatDistance,
  formatPrice,
  formatShortDate,
  formatTime,
  formatWindow,
  windowParts,
} from '@/lib/format';
import { useSettings } from '@/settings/settings';

/** Formatting helpers bound to the customer's language and currency. */
export function useFormat() {
  const { t } = useTranslation();
  const { language, currency } = useSettings();
  return {
    price: (pesos: number) => formatPrice(pesos, currency, language),
    time: (time: string) => formatTime(time, language),
    window: (from: string, to: string) => formatWindow(from, to, language),
    windowParts: (from: string, to: string) => windowParts(from, to, language),
    /** "a 400 m" / "400 m away" */
    distanceAway: (meters: number) =>
      t('common.distanceAway', { distance: formatDistance(meters, language) }),
    date: (isoDate: string) => formatShortDate(isoDate, language),
  };
}
