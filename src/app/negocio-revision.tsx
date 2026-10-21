import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertCircleIcon, CheckIcon, ClockIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { homeFor, useAccount } from '@/settings/account';
import { colors } from '@/theme';

/**
 * Waitlist: a new business that sent its documents waits here until the team
 * approves (or denies) it (decision 0016). It's what the business sees every
 * time it signs in until then.
 * Design: napita-docs/design/canvas/ShopWaitlist.dc.html
 */
export default function BusinessReview() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { ready, account, signOut, setReview } = useAccount();

  if (!ready) return null;
  if (!account) return <Redirect href="/" />;
  if (account.type !== 'business' || !account.review || account.review === 'approved')
    return <Redirect href={homeFor(account)} />;

  const denied = account.review === 'denied';
  const docs = account.documents;
  const received = docs
    ? ([
        'bankCertificate',
        'rut',
        'legalRepId',
        ...(docs.legalType === 'juridica' ? (['chamberOfCommerce'] as const) : []),
      ] as const)
    : [];

  const logOut = () => {
    signOut();
    router.replace('/');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}>
      <StatusBar style="dark" />
      <View style={[styles.icon, denied && { backgroundColor: colors.pendingBg }]}>
        {denied ? (
          <AlertCircleIcon size={44} color={colors.pendingText} />
        ) : (
          <ClockIcon size={44} color={colors.green} />
        )}
      </View>

      <View style={{ gap: 8, alignItems: 'center' }}>
        <View style={[styles.pill, denied && { backgroundColor: colors.pendingBg }]}>
          <Text font="bold" style={{ fontSize: 13, color: denied ? colors.pendingText : colors.green }}>
            {denied ? t('review.deniedPill') : t('review.pendingPill')}
          </Text>
        </View>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {denied ? t('review.deniedTitle') : t('review.title', { name: account.business?.name ?? '' })}
        </Text>
        <Text style={styles.body}>{denied ? t('review.deniedBody') : t('review.body')}</Text>
      </View>

      {!denied && received.length > 0 && (
        <View style={styles.card}>
          <Text font="bold" style={{ fontSize: 15 }}>
            {t('review.received')}
          </Text>
          {received.map((key) => (
            <View key={key} style={styles.row}>
              <CheckIcon size={18} color={colors.green} strokeWidth={2.4} />
              <Text style={{ fontSize: 15, flex: 1 }}>{t(`documents.${key}`)}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable accessibilityRole="button" onPress={logOut} style={styles.signOut}>
        <Text font="bold" style={{ fontSize: 15, color: colors.danger }}>
          {t('business.profile.signOut')}
        </Text>
      </Pressable>

      {/* Lets the team try the app until reviews happen in napita-backend. Not in store builds. */}
      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setReview('approved');
            router.replace('/hoy');
          }}
          style={styles.devButton}>
          <Text font="semibold" style={{ fontSize: 13, color: colors.grey }}>
            {t('review.devApprove')}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 24, gap: 22, alignItems: 'stretch' },
  icon: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: { backgroundColor: colors.greenTint, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 23, color: colors.grey, textAlign: 'center' },
  card: { backgroundColor: colors.mist, borderRadius: 18, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  signOut: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
