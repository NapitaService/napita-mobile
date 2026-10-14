import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/form';
import { AlertCircleIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { useBusiness } from '@/settings/business';
import { colors } from '@/theme';

/**
 * The code didn't match a waiting order. Design: napita-docs/design/canvas/PickupError.dc.html
 * Params: `code` (typed code that matched nothing), `notOurs` (scanned a QR that isn't
 * a Ñapita order), or `already` (order id that was already handed over).
 */
export default function PickupError() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { code, notOurs, already } = useLocalSearchParams<{ code?: string; notOurs?: string; already?: string }>();
  const { pickups } = useBusiness();
  const alreadyPickup = already ? pickups.find((p) => p.id === already) : undefined;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.middle, { paddingTop: insets.top + 40 }]}>
        <View style={styles.icon}>
          <AlertCircleIcon size={48} color={colors.pendingText} />
        </View>

        {alreadyPickup ? (
          <>
            <Text font="display" style={styles.title} accessibilityRole="header">
              {t('business.codeError.alreadyTitle')}
            </Text>
            <Text style={styles.text}>{t('business.codeError.alreadyBody', { name: alreadyPickup.name })}</Text>
          </>
        ) : (
          <>
            <Text font="display" style={styles.title} accessibilityRole="header">
              {t('business.codeError.title')}
            </Text>
            {code ? (
              <Text style={{ fontSize: 16, color: colors.grey }}>
                {t('business.codeError.typed')}{' '}
                <Text font="bold" style={{ color: colors.ink, letterSpacing: 2 }}>
                  {code}
                </Text>
              </Text>
            ) : (
              notOurs && <Text style={styles.text}>{t('business.codeError.scannedOther')}</Text>
            )}
            <View style={styles.reasons}>
              <Text font="bold" style={styles.reason}>
                {t('business.codeError.reasonsTitle')}
              </Text>
              <Text style={styles.reason}>• {t('business.codeError.reasonTypo')}</Text>
              <Text style={styles.reason}>• {t('business.codeError.reasonOtherDay')}</Text>
              <Text style={styles.reason}>• {t('business.codeError.reasonOtherBusiness')}</Text>
            </View>
            <Text style={[styles.text, { fontSize: 14 }]}>{t('business.codeError.askCustomer')}</Text>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <PrimaryButton label={t('business.codeError.scanAgain')} onPress={() => router.replace('/entrega/escanear')} />
        <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/entregas')} style={styles.secondary}>
          <Text font="bold" style={{ fontSize: 16 }}>
            {t('business.codeError.searchByName')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  middle: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 28 },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.pendingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 30, lineHeight: 34, textAlign: 'center' },
  text: { fontSize: 16, lineHeight: 22, color: colors.grey, textAlign: 'center' },
  reasons: { alignSelf: 'stretch', backgroundColor: colors.mist, borderRadius: 16, padding: 14, gap: 8 },
  reason: { fontSize: 15, lineHeight: 21 },
  bottom: { paddingHorizontal: 20, gap: 10 },
  secondary: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
