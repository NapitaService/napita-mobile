import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BusinessHeader } from '@/components/business-screen';
import { CardIcon, ChevronRightIcon, GlobeIcon } from '@/components/icons';
import { LogoPicker } from '@/components/logo-picker';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { lastDigits, TEST_TRANSFER_COP } from '@/data/business';
import { formatCOP, formatDays } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { formatPhone, useAccount } from '@/settings/account';
import { useBusiness } from '@/settings/business';
import { useSettings } from '@/settings/settings';
import { colors } from '@/theme';

/**
 * Negocio: the business's details, logo and opening hours, language, and Cerrar sesión
 * (the only way to switch to a customer account, decision 0005).
 * Design: napita-docs/design/canvas/ShopProfile.dc.html
 */
export default function BusinessProfile() {
  const { t } = useTranslation();
  const format = useFormat();
  const { language, setLanguage } = useSettings();
  const { account, signOut, saveBusiness } = useAccount();
  const { business, payouts } = useBusiness();

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
          <View style={{ marginTop: 10 }}>
            <LogoPicker
              logo={business.logo}
              businessName={business.name}
              onChange={(logo) => saveBusiness({ ...business, logo })}
            />
          </View>
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

        {/* Where Ñapita sends the business's money (decision 0015). */}
        <Section title={t('payout.title')}>
          {business.payout ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CardIcon size={22} color={colors.green} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text font="bold" style={{ fontSize: 15 }}>
                    {business.payout.method === 'bank'
                      ? t('payout.summaryBank', {
                          bank: business.payout.bank,
                          type: t(`payout.${business.payout.accountType}`),
                          last: lastDigits(business.payout.accountNumber),
                        })
                      : t('payout.summaryNequi', { last: lastDigits(business.payout.phone) })}
                  </Text>
                  <Text style={styles.line}>{business.payout.holderName}</Text>
                </View>
              </View>
              {business.payout.status === 'verifying' ? (
                <Text font="semibold" style={[styles.line, { color: colors.pendingText }]}>
                  {t('payout.verifying', { amount: formatCOP(TEST_TRANSFER_COP) })}
                </Text>
              ) : (
                <Text font="semibold" style={[styles.line, { color: colors.green }]}>
                  {t('payout.verified')}
                </Text>
              )}
              <Pressable accessibilityRole="button" onPress={() => router.push('/negocio-pagos')} style={styles.link}>
                <Text font="bold" style={{ fontSize: 15, color: colors.green }}>
                  {t('payout.change')}
                </Text>
                <ChevronRightIcon size={16} color={colors.green} />
              </Pressable>
            </>
          ) : (
            <View style={styles.payoutMissing}>
              <View style={{ gap: 2 }}>
                <Text font="bold" style={{ fontSize: 15, color: colors.pendingText }}>
                  {t('payout.missingTitle')}
                </Text>
                <Text style={{ fontSize: 13, lineHeight: 18, color: colors.pendingText }}>
                  {t('payout.missingBody')}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/negocio-pagos')}
                style={styles.payoutButton}>
                <Text font="bold" style={{ fontSize: 15, color: colors.white }}>
                  {t('payout.add')}
                </Text>
              </Pressable>
            </View>
          )}
        </Section>

        {/* Every 2 weeks, no minimum; a period with nothing to pay says so in words (decision 0015). */}
        <Section title={t('payouts.title')}>
          <Text style={styles.line}>{t('payouts.next', { date: format.date(payouts.next.date) })}</Text>
          {payouts.next.amount > 0 ? (
            <Text font="display" style={{ fontSize: 28, color: colors.green }}>
              {formatCOP(payouts.next.amount)}
            </Text>
          ) : (
            <Text font="bold" style={{ fontSize: 17 }}>
              {t('payouts.nothingYet')}
            </Text>
          )}
          <Text style={styles.line}>{t('payouts.rules')}</Text>
          {payouts.history.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text font="bold" style={{ fontSize: 14, marginBottom: 2 }}>
                {t('payouts.history')}
              </Text>
              {payouts.history.map((p, i) => (
                <View
                  key={p.date}
                  style={[styles.payoutRow, i === payouts.history.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={{ fontSize: 15 }}>{format.date(p.date)}</Text>
                  {p.amount > 0 ? (
                    <Text font="bold" style={{ fontSize: 15 }}>
                      {formatCOP(p.amount)}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 15, color: colors.grey }}>{t('payouts.none')}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
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
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  payoutMissing: { backgroundColor: colors.pendingBg, borderRadius: 14, padding: 14, gap: 12, marginVertical: -2 },
  payoutButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.pendingText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOut: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
