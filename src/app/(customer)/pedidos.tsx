import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { getPlace, pastOrders, upcomingOrders } from '@/data/sample';
import { formatDuration } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { colors } from '@/theme';

/** Pedidos. Design: napita-docs/design/canvas/CustomerOrders.dc.html */
export default function Orders() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}>
      <StatusBar style="dark" />
      <Text font="display" style={styles.title} accessibilityRole="header">
        {t('orders.title')}
      </Text>

      <Segmented
        accessibilityLabel={t('orders.title')}
        options={[
          { value: 'upcoming', label: t('orders.upcoming', { count: upcomingOrders.length }) },
          { value: 'past', label: t('orders.past') },
        ]}
        value={tab}
        onChange={setTab}
        selectedBg={colors.white}
        selectedText={colors.ink}
        text={colors.grey}
        trackBg={colors.segment}
        height={38}
        style={styles.tabs}
      />

      {tab === 'upcoming' ? (
        <>
          {upcomingOrders.length === 0 && <Text style={styles.empty}>{t('orders.noUpcoming')}</Text>}
          {upcomingOrders.map((order) => (
            <UpcomingOrder key={order.id} order={order} />
          ))}
          <View style={{ gap: 4 }}>
            <Text font="bold" style={styles.sectionTitle}>
              {t('orders.recent')}
            </Text>
            <PastOrder order={pastOrders[0]} />
          </View>
        </>
      ) : (
        <View style={{ gap: 8 }}>
          {pastOrders.map((order) => (
            <PastOrder key={order.id} order={order} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function UpcomingOrder({ order }: { order: (typeof upcomingOrders)[number] }) {
  const { t } = useTranslation();
  const format = useFormat();
  const place = getPlace(order.placeId);

  const openDirections = () => {
    const { latitude: lat, longitude: lng } = place;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.order}>
      <View style={styles.orderHeader}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 13, color: colors.white, opacity: 0.85 }}>{t('orders.pickUpToday')}</Text>
          <Text font="bold" style={{ fontSize: 18, color: colors.white }}>
            {format.window(place.pickupFrom, place.pickupTo)}
          </Text>
        </View>
        <View style={styles.countdown}>
          <Text font="bold" style={{ fontSize: 12 }}>
            {t('orders.startsIn', { time: formatDuration(order.startsInMinutes) })}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.placeRow}>
          <View style={[styles.placePhoto, { backgroundColor: place.tint }]} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text font="bold" style={{ fontSize: 17 }}>
              {place.name}
            </Text>
            <Text style={styles.secondary}>
              {t('orders.summary', {
                quantity: order.quantity,
                kind: t(`bagKinds.${place.category}`),
                price: format.price(order.paid),
              })}
            </Text>
          </View>
        </View>

        <View style={styles.codeBox}>
          <QRCode value={`napita:order:${order.id}:${order.code}`} size={88} color={colors.ink} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.secondary}>{t('orders.showCode')}</Text>
            <Text font="display" style={styles.code} accessibilityLabel={order.code.split('').join(' ')}>
              {order.code}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={openDirections} style={styles.outlineButton}>
            <Text font="bold" style={{ fontSize: 15 }}>
              {t('orders.directions')}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.outlineButton}>
            <Text font="bold" style={{ fontSize: 15 }}>
              {t('orders.contact')}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.secondary, { lineHeight: 18 }]}>
          {place.address} · {t('orders.cancelUntil', { time: format.time(order.cancelUntil) })}
        </Text>
      </View>
    </View>
  );
}

function PastOrder({ order }: { order: (typeof pastOrders)[number] }) {
  const { t } = useTranslation();
  const format = useFormat();
  const place = getPlace(order.placeId);
  return (
    <View style={styles.past}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text font="semibold" style={{ fontSize: 15 }}>
          {place.name}
        </Text>
        <Text style={styles.secondary}>
          {t('orders.pastRow', { date: format.date(order.date), price: format.price(order.paid) })}
        </Text>
      </View>
      {!order.rated && (
        <Pressable accessibilityRole="button" style={styles.rate} hitSlop={4}>
          <Text font="bold" style={{ fontSize: 13, color: colors.green }}>
            {t('orders.rate')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 18 },
  title: { fontSize: 32, letterSpacing: -0.5 },
  tabs: { borderRadius: 14, padding: 4 },
  empty: { fontSize: 15, color: colors.grey },
  sectionTitle: { fontSize: 16, marginBottom: 4 },
  order: { backgroundColor: colors.white, borderRadius: 22, overflow: 'hidden' },
  orderHeader: {
    backgroundColor: colors.green,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countdown: { backgroundColor: colors.yellow, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  orderBody: { padding: 18, gap: 16 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placePhoto: { width: 52, height: 52, borderRadius: 14 },
  secondary: { fontSize: 13, color: colors.grey },
  codeBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.dashed,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  code: { fontSize: 36, letterSpacing: 4 },
  outlineButton: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  past: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rate: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.greenTint,
    justifyContent: 'center',
  },
});
