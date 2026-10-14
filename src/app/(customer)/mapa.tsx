import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FiltersIcon, SearchIcon } from '@/components/icons';
import { PlacesMap } from '@/components/map/places-map';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { places, type Place } from '@/data/sample';
import { useFormat } from '@/lib/use-format';
import { colors, fonts } from '@/theme';

const shadow = {
  shadowColor: colors.ink,
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};

/** Mapa. Design: napita-docs/design/canvas/CustomerMap.dc.html */
export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('la-espiga');

  const visible = places.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = visible.find((p) => p.id === selectedId) ?? null;

  // Checkout isn't designed yet (napita-docs/design/flows/customer-reserve.md).
  const reserve = () => Alert.alert(t('map.checkoutTitle'), t('map.checkoutBody'), [{ text: t('map.ok') }]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {view === 'map' ? (
        <PlacesMap places={visible} selectedId={selectedId} onSelect={setSelectedId} />
      ) : (
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={{ paddingTop: insets.top + 130, paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}>
          {visible.map((place) => (
            <PlaceCard key={place.id} place={place} onReserve={reserve} />
          ))}
        </ScrollView>
      )}

      <View style={[styles.overlay, { top: insets.top + 12 }]} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={[styles.search, shadow]}>
            <SearchIcon size={18} color={colors.grey} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('map.searchPlaceholder')}
              placeholderTextColor={colors.grey}
              returnKeyType="search"
              style={styles.searchInput}
            />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t('map.filters')} style={[styles.filters, shadow]}>
            <FiltersIcon size={20} />
          </Pressable>
        </View>
        <Segmented
          accessibilityLabel={t('map.mapView')}
          options={[
            { value: 'map', label: t('map.mapView') },
            { value: 'list', label: t('map.listView') },
          ]}
          value={view}
          onChange={setView}
          selectedBg={colors.ink}
          text={colors.ink}
          trackBg={colors.white}
          style={[styles.toggle, shadow]}
        />
      </View>

      {view === 'map' && selected && (
        <View style={styles.bottom}>
          <PlaceCard place={selected} onReserve={reserve} floating />
        </View>
      )}
    </View>
  );
}

function PlaceCard({ place, onReserve, floating }: { place: Place; onReserve: () => void; floating?: boolean }) {
  const { t } = useTranslation();
  const format = useFormat();
  const window = format.windowParts(place.pickupFrom, place.pickupTo);
  const soldOut = place.left === 0;

  return (
    <View style={[styles.card, floating && styles.cardFloating]}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={[styles.photo, { backgroundColor: place.tint }]}>
          <Text style={{ fontSize: 11, color: colors.grey }}>{t('common.photo')}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.titleRow}>
            <Text font="bold" style={{ fontSize: 17, flexShrink: 1 }} numberOfLines={1}>
              {place.name}
            </Text>
            <Text font="bold" style={{ fontSize: 12, color: soldOut ? colors.grey : colors.orange }}>
              {soldOut ? t('common.soldOut') : t('common.left', { count: place.left })}
            </Text>
          </View>
          <Text style={styles.secondary}>
            {t(`bagKinds.${place.category}`)} · {format.distanceAway(place.distance)}
          </Text>
          <Text style={styles.secondary}>{t('map.pickUpToday', window)}</Text>
          <Text font="extrabold" style={{ fontSize: 18, color: colors.green, marginTop: 2 }}>
            {format.price(place.price)}
          </Text>
        </View>
      </View>
      {!soldOut && (
        <Pressable accessibilityRole="button" onPress={onReserve} style={styles.reserve}>
          <Text font="bold" style={{ fontSize: 16, color: colors.white }}>
            {t('map.reserve')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mapLand },
  overlay: { position: 'absolute', left: 16, right: 16, gap: 10 },
  searchRow: { flexDirection: 'row', gap: 8 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 15, color: colors.ink, height: '100%' },
  filters: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: { alignSelf: 'center', borderRadius: 20, padding: 4 },
  bottom: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 14, gap: 12 },
  cardFloating: {
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  photo: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  secondary: { fontSize: 13, color: colors.grey },
  reserve: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
