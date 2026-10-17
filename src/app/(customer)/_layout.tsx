import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BagIcon, HeartIcon, HomeIcon, PersonIcon, PinIcon } from '@/components/icons';
import { tabScreenOptions } from '@/components/tab-bar';
import { AccountGuard } from '@/components/account-guard';
import { colors } from '@/theme';

/** Customer mode: Descubrir, Mapa, Pedidos, Favoritos, Perfil. */
export default function CustomerTabs() {
  const { t } = useTranslation();
  return (
    <AccountGuard type="customer">
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen
          name="descubrir"
          options={{
            title: t('tabs.discover'),
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="mapa"
          options={{
            title: t('tabs.map'),
            tabBarIcon: ({ color }) => <PinIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="pedidos"
          options={{
            title: t('tabs.orders'),
            tabBarIcon: ({ color }) => <BagIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="favoritos"
          options={{
            title: t('tabs.favorites'),
            tabBarIcon: ({ color, focused }) => <HeartIcon color={color} fill={focused ? colors.green : 'none'} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color }) => <PersonIcon color={color} />,
          }}
        />
      </Tabs>
    </AccountGuard>
  );
}
