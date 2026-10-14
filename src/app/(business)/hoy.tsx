import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BusinessHeader } from '@/components/business-screen';
import { PlusIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { Toggle } from '@/components/toggle';
import { formatCOP } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { useBusiness } from '@/settings/business';
import { colors } from '@/theme';

/** Hoy (business dashboard). Design: napita-docs/design/canvas/ShopToday.dc.html */
export default function BusinessToday() {
  const { t } = useTranslation();
  const format = useFormat();
  const { business, bags, pickups, countsFor, receivingOrders, setReceivingOrders, startDraft } = useBusiness();

  const live = bags.filter((b) => b.live);
  const published = live.reduce((sum, b) => sum + b.quantity, 0);
  const reserved = live.reduce((sum, b) => sum + countsFor(b.id).reserved, 0);
  // Business side always shows pesos (napita-docs/product/currency-and-payments.md).
  const sales = live.reduce((sum, b) => sum + countsFor(b.id).reserved * b.price, 0);
  const window = format.windowParts(business.pickupFrom, business.pickupTo);

  const newBag = () => {
    startDraft();
    router.push('/nueva-bolsa');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <BusinessHeader title={business.name}>
        <View style={styles.receiving}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text font="bold" style={{ fontSize: 15, color: colors.white }}>
              {t('business.today.receiving')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.white, opacity: 0.8 }}>
              {t('business.today.pickupWindow', window)}
            </Text>
          </View>
          <Toggle
            value={receivingOrders}
            onChange={setReceivingOrders}
            onColor={colors.switchOnDark}
            accessibilityLabel={t('business.today.receiving')}
          />
        </View>
      </BusinessHeader>

      <View style={styles.body}>
        <View style={styles.stats}>
          <Stat value={String(published)} label={t('business.today.published')} />
          <Stat value={String(reserved)} label={t('business.today.reserved')} color={colors.green} />
          <Stat value={formatCOP(sales)} label={t('business.today.sales')} small />
        </View>

        <Pressable accessibilityRole="button" onPress={newBag} style={styles.publish}>
          <PlusIcon size={20} color={colors.white} />
          <Text font="bold" style={{ fontSize: 16, color: colors.white }}>
            {t('business.today.publishMore')}
          </Text>
        </Pressable>

        <View style={{ gap: 8 }}>
          <View style={styles.sectionHeader}>
            <Text font="bold" style={{ fontSize: 17 }}>
              {t('business.today.toCollect')}
            </Text>
            <Pressable accessibilityRole="link" onPress={() => router.navigate('/entregas')} hitSlop={12}>
              <Text font="semibold" style={{ fontSize: 14, color: colors.green }}>
                {t('business.today.seeAll')}
              </Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            {pickups.map((p, i) => (
              <View key={p.id} style={[styles.pickup, i === pickups.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ gap: 2 }}>
                  <Text font="bold" style={{ fontSize: 15 }}>
                    {p.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.grey }}>
                    {t('business.today.pickupRow', {
                      bags: t('business.today.bags', { count: p.quantity }),
                      code: p.code,
                    })}
                  </Text>
                </View>
                <View style={[styles.chip, { backgroundColor: p.delivered ? colors.doneBg : colors.pendingBg }]}>
                  <Text
                    font="bold"
                    style={{ fontSize: 12, color: p.delivered ? colors.green : colors.pendingText }}>
                    {p.delivered ? t('business.today.delivered') : t('business.today.pending')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label, color, small }: { value: string; label: string; color?: string; small?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text
        font="display"
        style={{ fontSize: small ? 19 : 28, lineHeight: 34, letterSpacing: small ? -0.4 : 0, color: color ?? colors.ink }}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={{ fontSize: 13, color: colors.grey }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  receiving: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  body: { paddingTop: 18, paddingHorizontal: 20, gap: 16 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 12, gap: 2 },
  publish: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  card: { backgroundColor: colors.white, borderRadius: 18, paddingVertical: 4, paddingHorizontal: 14 },
  pickup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
});
