import { useTranslation } from 'react-i18next';

import { BusinessScreen } from '@/components/business-screen';

/** Design: napita-docs/design/README.md → Business app → Bolsas (placeholder for now). */
export default function BusinessBags() {
  const { t } = useTranslation();
  return <BusinessScreen title={t('business.bags.title')} body={t('business.bags.body')} />;
}
