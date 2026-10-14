import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';

import { colors, fonts } from '@/theme';

/** Tab bar look shared by customer and business mode (from the canvas nav bar). */
export const tabScreenOptions: ComponentProps<typeof Tabs>['screenOptions'] = {
  headerShown: false,
  tabBarActiveTintColor: colors.green,
  tabBarInactiveTintColor: colors.grey,
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11, marginTop: 3 },
};
