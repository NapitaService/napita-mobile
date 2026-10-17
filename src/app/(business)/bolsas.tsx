import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BagImage } from '@/components/bag-image';
import { PlusIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { BAG_TINTS, type BusinessBag } from '@/data/business';
import { formatCOP, formatDays } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { useBusiness } from '@/settings/business';
import { useSettings } from '@/settings/settings';
import { colors, MIN_TOUCH } from '@/theme';

/** Bolsas (the business's bags). Design: napita-docs/design/canvas/ShopBags.dc.html */
export default function BusinessBags() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { bags, startDraft } = useBusiness();

  const newBag = () => {
    startDraft();
    router.push('/nueva-bolsa');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}>
      <StatusBar style="dark" />
      <View style={styles.titleRow}>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('business.bags.title')}
        </Text>
        <Pressable accessibilityRole="button" onPress={newBag} style={styles.newBag}>
          <PlusIcon size={18} color={colors.white} />
          <Text font="bold" style={{ fontSize: 15, color: colors.white }}>
            {t('business.bags.newBag')}
          </Text>
        </Pressable>
      </View>

      {bags.length === 0 && (
        <Text style={{ fontSize: 15, lineHeight: 21, color: colors.grey }}>{t('business.bags.empty')}</Text>
      )}
      {bags.map((bag) => (
        <BagCard key={bag.id} bag={bag} />
      ))}

      <Text style={styles.tip}>{t('business.bags.tip')}</Text>
    </ScrollView>
  );
}

function BagCard({ bag }: { bag: BusinessBag }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { language } = useSettings();
  const { business, setQuantity, publishToday, countsFor } = useBusiness();
  const { reserved, delivered } = countsFor(bag.id);

  const window = format.window(bag.from, bag.to);
  const when = bag.live
    ? t('business.bags.today', { window })
    : t('business.bags.repeats', { days: formatDays(bag.days, language, false), window });
  // Sold out = every bag reserved (customers pay when they reserve).
  const soldOut = bag.live && reserved >= bag.quantity;
  const status = !bag.live
    ? t('business.bags.notPublished')
    : [
        t('business.bags.reservedOf', { reserved, count: bag.quantity }),
        delivered > 0 && t('business.bags.deliveredCount', { count: delivered }),
        soldOut && t('business.bags.soldOut'),
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <BagImage
          photo={bag.photos[0]}
          logo={business.logo}
          businessName={business.name}
          tint={BAG_TINTS[bag.type]}
          style={styles.photo}
        />
        <View style={{ flex: 1, gap: 3 }}>
          <Text font="bold" style={{ fontSize: 16 }}>
            {bag.name}
          </Text>
          <Text style={styles.secondary}>{when}</Text>
          <Text style={styles.secondary}>
            {t('business.bags.price')}{' '}
            <Text font="bold" style={{ color: colors.green }}>
              {formatCOP(bag.price)}
            </Text>{' '}
            · {t('business.bags.contentValue', { value: formatCOP(bag.value) })}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: bag.live ? colors.doneBg : colors.pausedBg }]}>
          <Text font="bold" style={{ fontSize: 12, color: bag.live ? colors.green : colors.segmentText }}>
            {bag.live ? t('business.bags.live') : t('business.bags.paused')}
          </Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={{ fontSize: 14, color: colors.grey, flex: 1 }}>{status}</Text>
        {bag.live ? (
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('business.bags.oneLess')}
              onPress={() => setQuantity(bag.id, bag.quantity - 1)}
              disabled={bag.quantity <= reserved}
              style={[styles.stepButton, bag.quantity <= reserved && { opacity: 0.4 }]}>
              <Text font="bold" style={{ fontSize: 20 }}>
                −
              </Text>
            </Pressable>
            <Text font="extrabold" style={styles.quantity}>
              {bag.quantity}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('business.bags.oneMore')}
              onPress={() => setQuantity(bag.id, bag.quantity + 1)}
              style={styles.stepButton}>
              <Text font="bold" style={{ fontSize: 20 }}>
                +
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => publishToday(bag.id)} style={styles.publishToday}>
            <Text font="bold" style={{ fontSize: 14, color: colors.white }}>
              {t('business.bags.publishToday')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, letterSpacing: -0.5 },
  newBag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: MIN_TOUCH,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.green,
  },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 16, gap: 14 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  photo: { width: 56, height: 56, borderRadius: 14 },
  secondary: { fontSize: 13, color: colors.grey },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: { width: 44, textAlign: 'center', fontSize: 20 },
  publishToday: {
    height: MIN_TOUCH,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.green,
    justifyContent: 'center',
  },
  tip: { fontSize: 13, lineHeight: 19, color: colors.grey },
});
