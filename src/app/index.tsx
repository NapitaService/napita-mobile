import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoBagIcon } from '@/components/icons';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { useSettings } from '@/settings/settings';
import { colors } from '@/theme';

/** Welcome screen. Design: napita-docs/design/canvas/Main.dc.html */
export default function Welcome() {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettings();
  const insets = useSafeAreaInsets();

  const goCustomer = () => router.replace('/descubrir');
  const goBusiness = () => router.replace('/hoy');

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={[styles.hero, { paddingTop: insets.top + 60 }]} bounces={false}>
        <View style={styles.logo}>
          <LogoBagIcon size={60} strokeWidth={1.6} />
        </View>
        <Text font="display" style={styles.name}>
          {t('app.name')}
        </Text>
        <Text font="medium" style={styles.tagline}>
          {t('welcome.tagline')}
        </Text>
        <View style={styles.steps}>
          {(['welcome.step1', 'welcome.step2', 'welcome.step3'] as const).map((key, i) => (
            <View key={key} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text font="bold" style={styles.stepNumberText}>
                  {i + 1}
                </Text>
              </View>
              <Text style={styles.stepText}>{t(key)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Segmented
        accessibilityLabel={t('welcome.languageLabel')}
        options={[
          { value: 'es-CO', label: 'ES' },
          { value: 'en', label: 'EN' },
        ]}
        value={language}
        onChange={setLanguage}
        selectedBg={colors.white}
        selectedText={colors.green}
        text={colors.white}
        trackBg="rgba(255,255,255,0.16)"
        height={38}
        style={[styles.language, { top: insets.top + 8 }]}
      />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Pressable accessibilityRole="button" onPress={goCustomer} style={styles.primary}>
          <Text font="bold" style={styles.primaryText}>
            {t('welcome.seePlaces')}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={goBusiness} style={styles.secondary}>
          <Text font="bold" style={styles.secondaryText}>
            {t('welcome.haveBusiness')}
          </Text>
        </Pressable>
        <View style={styles.signInRow}>
          <Text style={styles.signInText}>{t('welcome.haveAccount')} </Text>
          <Pressable accessibilityRole="link" onPress={goCustomer} hitSlop={12}>
            <Text font="bold" style={[styles.signInText, { color: colors.green }]}>
              {t('welcome.signIn')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.green },
  hero: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 24, gap: 22 },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Extra line height so iOS doesn't clip the tilde on the Ñ.
  name: { fontSize: 64, lineHeight: 84, letterSpacing: -1.5, color: colors.white, marginVertical: -8 },
  tagline: { fontSize: 21, lineHeight: 28, color: colors.white, maxWidth: 330 },
  steps: { gap: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontSize: 14, color: colors.white },
  stepText: { flex: 1, fontSize: 16, lineHeight: 22, color: colors.white },
  language: { position: 'absolute', right: 20, borderRadius: 12 },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 24,
    gap: 12,
  },
  primary: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontSize: 17, color: colors.white },
  secondary: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontSize: 17, color: colors.ink },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 6, minHeight: 44, alignItems: 'center' },
  signInText: { fontSize: 15, color: colors.grey },
});
