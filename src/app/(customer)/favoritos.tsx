import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BellIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { favorites, getPlace, type FavoriteStatus } from '@/data/sample';
import { useFormat } from '@/lib/use-format';
import { colors, MIN_TOUCH } from '@/theme';

/** Favoritos. Design: napita-docs/design/canvas/CustomerFavorites.dc.html */
export default function Favorites() {
  const { t } = useTranslation();
  const format = useFormat();
  const insets = useSafeAreaInsets();
  const [bells, setBells] = useState(() => Object.fromEntries(favorites.map((f) => [f.placeId, f.bell])));

  const statusText = (status: FavoriteStatus) => {
    switch (status.type) {
      case 'bagsToday':
        return t('favorites.bagsToday', { count: status.count, window: format.window(status.from, status.to) });
      case 'notPostedYet':
        return t('favorites.notPostedYet');
      case 'usuallyPosts':
        return t('favorites.usuallyPosts', { time: format.time(status.time) });
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}>
      <StatusBar style="dark" />
      <View style={{ gap: 6 }}>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('favorites.title')}
        </Text>
        <Text style={styles.intro}>{t('favorites.intro')}</Text>
      </View>

      <View>
        {favorites.map(({ placeId, status }) => {
          const place = getPlace(placeId);
          const on = bells[placeId];
          const available = status.type === 'bagsToday';
          return (
            <View key={placeId} style={styles.row}>
              <View style={[styles.photo, { backgroundColor: place.tint }]} />
              <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                <Text font="bold" style={{ fontSize: 16 }}>
                  {place.name}
                </Text>
                <Text style={styles.secondary}>
                  {t(`categories.${place.category}`)} · {format.distanceAway(place.distance)}
                </Text>
                <Text
                  font={available ? 'bold' : 'regular'}
                  style={[styles.secondary, available && { color: colors.green }]}>
                  {statusText(status)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="switch"
                accessibilityLabel={`${t('favorites.notifyMe')}: ${place.name}`}
                accessibilityState={{ checked: on }}
                onPress={() => setBells((b) => ({ ...b, [placeId]: !b[placeId] }))}
                style={[styles.bell, { backgroundColor: on ? colors.green : colors.greenTint }]}>
                <BellIcon size={20} color={on ? colors.white : colors.grey} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  title: { fontSize: 32, letterSpacing: -0.5 },
  intro: { fontSize: 15, lineHeight: 21, color: colors.grey },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  photo: { width: 60, height: 60, borderRadius: 16 },
  secondary: { fontSize: 13, color: colors.grey },
  bell: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
