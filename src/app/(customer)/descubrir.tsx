import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BellIcon, ChevronDownIcon, PinIcon, SearchIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { AREA, type Category, type Place } from '@/data/sample';
import { useFormat } from '@/lib/use-format';
import { usePlaces } from '@/settings/orders';
import { colors, fonts, MIN_TOUCH } from '@/theme';

const FILTERS: ('all' | Category)[] = ['all', 'bakery', 'food', 'cafe', 'market', 'vegan'];

/** Lowercase without accents, so "panaderia" finds "Panadería". */
function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Descubrir (home feed). Design: napita-docs/design/canvas/CustomerDiscover.dc.html */
export default function Discover() {
  const { t } = useTranslation();
  const format = useFormat();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [query, setQuery] = useState('');

  const places = usePlaces();
  const visible = places.filter((p) => {
    if (p.left === 0) return false;
    if (filter !== 'all' && p.category !== filter) return false;
    if (!query.trim()) return true;
    const haystack = normalize(`${p.name} ${t(`categories.${p.category}`)} ${t(`bagKinds.${p.category}`)}`);
    return haystack.includes(normalize(query.trim()));
  });
  const featured = visible.filter((p) => p.featured);
  const lastOfTheDay = visible
    .filter((p) => !p.featured)
    .sort((a, b) => a.pickupTo.localeCompare(b.pickupTo));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24, gap: 20 }}
      keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.navigate('/mapa')} style={styles.location}>
            <PinIcon size={16} strokeWidth={2} />
            <Text font="semibold" style={{ fontSize: 14 }}>
              {t('discover.location', { area: AREA.name, radius: AREA.radiusKm })}
            </Text>
            <ChevronDownIcon size={14} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('discover.notifications')}
            onPress={() => router.navigate('/favoritos')}
            style={styles.bell}>
            <BellIcon size={22} />
          </Pressable>
        </View>

        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('discover.title')}
        </Text>

        <View style={styles.search}>
          <SearchIcon size={18} color={colors.grey} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('discover.searchPlaceholder')}
            placeholderTextColor={colors.grey}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => {
          const selected = f === filter;
          return (
            <Pressable
              key={f}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(f)}
              hitSlop={4}
              style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle]}>
              <Text font="semibold" style={{ fontSize: 14, color: selected ? colors.white : colors.ink }}>
                {t(`categories.${f}`)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {visible.length === 0 && <Text style={styles.empty}>{t('discover.noResults')}</Text>}

      {featured.length > 0 && (
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeader}>
            <Text font="bold" style={styles.sectionTitle}>
              {t('discover.pickUpToday')}
            </Text>
            <Pressable accessibilityRole="link" onPress={() => router.navigate('/mapa')} hitSlop={12}>
              <Text font="semibold" style={{ fontSize: 14, color: colors.green }}>
                {t('discover.seeAll')}
              </Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
            {featured.map((place) => (
              <FeaturedCard key={place.id} place={place} />
            ))}
          </ScrollView>
        </View>
      )}

      {lastOfTheDay.length > 0 && (
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <Text font="bold" style={styles.sectionTitle}>
            {t('discover.lastOfTheDay')}
          </Text>
          {lastOfTheDay.map((place) => (
            <View key={place.id} style={styles.row}>
              <View style={[styles.rowPhoto, { backgroundColor: place.tint }]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text font="bold" style={{ fontSize: 15 }}>
                  {place.name}
                </Text>
                <Text font="semibold" style={{ fontSize: 13, color: colors.orange }}>
                  {t('discover.pickUpBefore', { time: format.time(place.pickupTo) })}
                </Text>
              </View>
              <Text font="extrabold" style={{ fontSize: 16, color: colors.green }}>
                {format.price(place.price)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function FeaturedCard({ place }: { place: Place }) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <View style={styles.card}>
      <View style={[styles.cardPhoto, { backgroundColor: place.tint }]}>
        <Text style={{ fontSize: 13, color: colors.grey }}>{t('common.placePhoto')}</Text>
        <View style={styles.leftBadge}>
          <Text font="bold" style={{ fontSize: 12, color: colors.orange }}>
            {t('common.left', { count: place.left })}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text font="bold" style={{ fontSize: 16 }}>
          {place.name}
        </Text>
        <Text style={styles.secondary}>
          {t(`bagKinds.${place.category}`)} · {format.window(place.pickupFrom, place.pickupTo)}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.secondary}>{format.distanceAway(place.distance)}</Text>
          <Text font="extrabold" style={{ fontSize: 18, color: colors.green }}>
            {format.price(place.price)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  top: { paddingHorizontal: 20, gap: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.greenTint,
    borderRadius: 22,
    height: MIN_TOUCH,
    paddingHorizontal: 14,
  },
  bell: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, lineHeight: 34, letterSpacing: -0.5 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.mist,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink, height: '100%' },
  chips: { gap: 8, paddingHorizontal: 20 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 18, justifyContent: 'center' },
  chipSelected: { backgroundColor: colors.ink },
  chipIdle: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.chipBorder },
  empty: { paddingHorizontal: 20, fontSize: 15, color: colors.grey },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: { fontSize: 19 },
  cards: { gap: 12, paddingHorizontal: 20 },
  card: {
    width: 260,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  cardPhoto: { height: 120, alignItems: 'center', justifyContent: 'center' },
  leftBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  secondary: { fontSize: 13, color: colors.grey },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowPhoto: { width: 56, height: 56, borderRadius: 14 },
});
