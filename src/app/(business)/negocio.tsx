import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BusinessHeader } from '@/components/business-screen';
import { ChevronRightIcon, GlobeIcon } from '@/components/icons';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { formatDays } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { formatPhone, useAccount } from '@/settings/account';
import { useBusiness } from '@/settings/business';
import { useSettings } from '@/settings/settings';
import { colors } from '@/theme';

/**
 * Negocio: the business's details and opening hours, language, and Cerrar sesión
 * (the only way to switch to a customer account, decision 0005).
 * Design: napita-docs/design/canvas/ShopProfile.dc.html
 */
export default function BusinessProfile() {
  const { t } = useTranslation();
  const format = useFormat();
  const { language, setLanguage } = useSettings();
  const { account, signOut } = useAccount();
  const { business } = useBusiness();

  const logOut = () => {
    signOut();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <BusinessHeader title={t('business.profile.title')} />

      <View style={styles.body}>
        <Section title={t('business.profile.details')}>
          <Text font="bold" style={{ fontSize: 17 }}>
            {business.name}
          </Text>
          <Text style={styles.line}>{t(`signup.types.${business.type}`)}</Text>
          <Text style={styles.line}>{business.address}</Text>
          <Text style={styles.line}>+57 {formatPhone(account?.phone ?? '')}</Text>
        </Section>

        <Section title={t('business.profile.hours')}>
          <Text font="semibold" style={{ fontSize: 15 }}>
            {t('business.profile.open', {
              days: formatDays(business.openDays, language, false),
              ...format.windowParts(business.opens, business.closes),
            })}
          </Text>
          <Text style={styles.line}>
            {t('business.profile.pickup', { window: format.window(business.pickupFrom, business.pickupTo) })}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/negocio-nuevo/horario', params: { editar: '1' } })}
            style={styles.link}>
            <Text font="bold" style={{ fontSize: 15, color: colors.green }}>
              {t('business.profile.changeHours')}
            </Text>
            <ChevronRightIcon size={16} color={colors.green} />
          </Pressable>
        </Section>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.label}>
              <GlobeIcon size={20} color={colors.green} />
              <Text font="semibold" style={{ fontSize: 15 }}>
                {t('profile.language')}
              </Text>
            </View>
            <Segmented
              accessibilityLabel={t('profile.language')}
              options={[
                { value: 'es-CO', label: t('profile.spanish') },
                { value: 'en', label: t('profile.english') },
              ]}
              value={language}
              onChange={setLanguage}
            />
          </View>
        </View>

        <Text style={styles.note}>{t('business.profile.more')}</Text>

        <View style={{ gap: 6 }}>
          <Pressable accessibilityRole="button" onPress={logOut} style={styles.signOut}>
            <Text font="bold" style={{ fontSize: 15, color: colors.danger }}>
              {t('business.profile.signOut')}
            </Text>
          </Pressable>
          <Text style={[styles.note, { textAlign: 'center' }]}>{t('business.profile.signOutHint')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text font="bold" style={{ fontSize: 16 }}>
        {title}
      </Text>
      <View style={[styles.card, { paddingVertical: 14, gap: 4 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  content: { paddingBottom: 24 },
  body: { paddingTop: 18, paddingHorizontal: 20, gap: 16 },
  card: { backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 4 },
  line: { fontSize: 14, lineHeight: 20, color: colors.grey },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, alignSelf: 'flex-start' },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  note: { fontSize: 13, lineHeight: 18, color: colors.grey },
  signOut: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
