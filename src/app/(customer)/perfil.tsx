import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronRightIcon, CoinsIcon, GlobeIcon, StorefrontIcon } from '@/components/icons';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { profileStats } from '@/data/sample';
import { useSettings } from '@/settings/settings';
import { colors } from '@/theme';

const SETTINGS_ROWS = [
  'profile.paymentMethods',
  'profile.notifications',
  'profile.location',
  'profile.helpPrivacy',
] as const;

/** Perfil. Design: napita-docs/design/canvas/CustomerProfile.dc.html */
export default function Profile() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, currency, setCurrency } = useSettings();
  const name = t('profile.namePlaceholder');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text font="display" style={{ fontSize: 24 }}>
            {name.replace(/[^\p{L}]/gu, '').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text font="display" style={{ fontSize: 24 }}>
            {name}
          </Text>
          <Text style={{ fontSize: 14, color: colors.grey }}>{t('profile.emailPlaceholder')}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat value={profileStats.bagsCollected} label={t('profile.bagsCollected')} />
        <Stat value={profileStats.placesDiscovered} label={t('profile.placesDiscovered')} />
      </View>

      <View style={styles.card}>
        <Row icon={<GlobeIcon size={20} color={colors.green} />} label={t('profile.language')}>
          <Segmented
            accessibilityLabel={t('profile.language')}
            options={[
              { value: 'es-CO', label: t('profile.spanish') },
              { value: 'en', label: t('profile.english') },
            ]}
            value={language}
            onChange={setLanguage}
          />
        </Row>
        <Row icon={<CoinsIcon size={20} color={colors.green} />} label={t('profile.currency')}>
          <Segmented
            accessibilityLabel={t('profile.currency')}
            options={[
              { value: 'COP', label: 'COP' },
              { value: 'USD', label: 'USD' },
            ]}
            value={currency}
            onChange={setCurrency}
          />
        </Row>
        {currency === 'USD' && <Text style={styles.note}>{t('profile.usdNote')}</Text>}
        {SETTINGS_ROWS.map((key, i) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            style={[styles.linkRow, i === SETTINGS_ROWS.length - 1 && { borderBottomWidth: 0 }]}>
            <Text font="semibold" style={{ fontSize: 15 }}>
              {t(key)}
            </Text>
            <ChevronRightIcon size={16} color={colors.grey} />
          </Pressable>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.replace('/hoy')} style={styles.business}>
        <StorefrontIcon color={colors.green} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text font="bold" style={{ fontSize: 15 }}>
            {t('profile.haveBusiness')}
          </Text>
          <Text style={{ fontSize: 13, color: colors.grey }}>{t('profile.switchToBusiness')}</Text>
        </View>
        <ChevronRightIcon size={16} color={colors.grey} />
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.signOut}>
        <Text font="bold" style={{ fontSize: 15, color: colors.danger }}>
          {t('profile.signOut')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text font="display" style={{ fontSize: 28, color: colors.white }}>
        {value}
      </Text>
      <Text style={{ fontSize: 13, color: colors.white, opacity: 0.85 }}>{label}</Text>
    </View>
  );
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {icon}
        <Text font="semibold" style={{ fontSize: 15 }}>
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    backgroundColor: colors.green,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 12,
  },
  card: { backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 4 },
  settingRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.grey,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  linkRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  business: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signOut: { height: 44, alignItems: 'center', justifyContent: 'center' },
});
