import '@/i18n';

import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { Figtree_800ExtraBold } from '@expo-google-fonts/figtree/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AccountProvider } from '@/settings/account';
import { BusinessProvider } from '@/settings/business';
import { SettingsProvider } from '@/settings/settings';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_800ExtraBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SettingsProvider>
      <AccountProvider>
        <BusinessProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.mist } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(customer)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(business)" options={{ animation: 'fade' }} />
            <Stack.Screen name="cuenta/index" options={{ contentStyle: { backgroundColor: colors.white } }} />
            <Stack.Screen name="cuenta/codigo" options={{ contentStyle: { backgroundColor: colors.white } }} />
            <Stack.Screen name="nueva-bolsa/index" options={{ contentStyle: { backgroundColor: colors.white } }} />
            <Stack.Screen name="nueva-bolsa/precio" options={{ contentStyle: { backgroundColor: colors.white } }} />
            <Stack.Screen name="nueva-bolsa/horario" options={{ contentStyle: { backgroundColor: colors.white } }} />
            <Stack.Screen
              name="nueva-bolsa/publicada"
              options={{ contentStyle: { backgroundColor: colors.white }, gestureEnabled: false }}
            />
          </Stack>
        </BusinessProvider>
      </AccountProvider>
    </SettingsProvider>
  );
}
