import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BagIcon, ChartIcon, CheckCircleIcon, StorefrontIcon } from '@/components/icons';
import { tabScreenOptions } from '@/components/tab-bar';
import { AccountGuard } from '@/components/account-guard';

/** Business mode: Hoy, Bolsas, Entregas, Negocio. */
export default function BusinessTabs() {
  const { t } = useTranslation();
  return (
    <AccountGuard type="business">
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen
          name="hoy"
          options={{
            title: t('tabs.today'),
            tabBarIcon: ({ color }) => <ChartIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="bolsas"
          options={{
            title: t('tabs.bags'),
            tabBarIcon: ({ color }) => <BagIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="entregas"
          options={{
            title: t('tabs.pickups'),
            tabBarIcon: ({ color }) => <CheckCircleIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="negocio"
          options={{
            title: t('tabs.business'),
            tabBarIcon: ({ color }) => <StorefrontIcon color={color} />,
          }}
        />
      </Tabs>
    </AccountGuard>
  );
}
