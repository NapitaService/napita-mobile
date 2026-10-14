import { useTranslation } from 'react-i18next';

import { BusinessScreen } from '@/components/business-screen';

/** Design: napita-docs/design/README.md → Business app → Hoy (placeholder for now). */
export default function BusinessToday() {
  const { t } = useTranslation();
  return <BusinessScreen title={t('business.today.title')} body={t('business.today.body')} />;
}
