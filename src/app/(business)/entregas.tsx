import { useTranslation } from 'react-i18next';

import { BusinessScreen } from '@/components/business-screen';

/** Design: napita-docs/design/README.md → Business app → Entregas (placeholder for now). */
export default function BusinessPickups() {
  const { t } = useTranslation();
  return <BusinessScreen title={t('business.pickups.title')} body={t('business.pickups.body')} />;
}
