import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { BusinessScreen } from '@/components/business-screen';
import { ChevronRightIcon, GlobeIcon, PersonIcon } from '@/components/icons';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { useSettings } from '@/settings/settings';
import { colors } from '@/theme';

/** Design: napita-docs/design/canvas/ShopProfile.dc.html (placeholder plus language switch). */
export default function BusinessProfile() {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettings();

  return (
    <BusinessScreen title={t('business.profile.title')} body={t('business.profile.body')}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.label}>
            <GlobeIcon size={20} color={colors.green} />
            <Text font="semibold" style={styles.labelText}>
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
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/descubrir')}
          style={[styles.row, styles.lastRow]}>
          <View style={styles.label}>
            <PersonIcon size={20} color={colors.green} />
            <Text font="semibold" style={styles.labelText}>
              {t('business.switchToCustomer')}
            </Text>
          </View>
          <ChevronRightIcon size={16} color={colors.grey} />
        </Pressable>
      </View>
    </BusinessScreen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 4, marginHorizontal: 20 },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  lastRow: { borderBottomWidth: 0 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  labelText: { fontSize: 15 },
});
