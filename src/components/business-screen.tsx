import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/text';
import { formatShortDate, todayISO } from '@/lib/format';
import { useSettings } from '@/settings/settings';
import { colors } from '@/theme';

type Props = {
  title: string;
  body: string;
  children?: ReactNode;
};

/**
 * Placeholder for a business-mode tab: the dark "Modo negocio" header from
 * napita-docs/design/canvas/ShopToday.dc.html and a note on what goes here.
 */
export function BusinessScreen({ title, body, children }: Props) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Text font="bold" style={styles.badgeText}>
              {t('business.badge').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.date}>{formatShortDate(todayISO(), language)}</Text>
        </View>
        <Text font="display" style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.body}>{body}</Text>
        <Text font="semibold" style={styles.soon}>
          {t('business.comingSoon')}
        </Text>
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  content: { gap: 16, paddingBottom: 24 },
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: colors.yellow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, letterSpacing: 1, color: colors.ink },
  date: { fontSize: 14, color: colors.white, opacity: 0.8 },
  title: { fontSize: 30, letterSpacing: -0.5, color: colors.white },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 18, marginHorizontal: 20, gap: 10 },
  body: { fontSize: 16, lineHeight: 23 },
  soon: { fontSize: 14, color: colors.grey },
});
