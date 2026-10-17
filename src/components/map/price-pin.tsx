import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/text';
import type { Place } from '@/data/sample';
import { useFormat } from '@/lib/use-format';
import { colors } from '@/theme';

/** Price bubble on the map. Green when selected, "Agotado" when sold out, "Sin bolsas hoy" when the business is off today. */
export function PricePin({ place, selected }: { place: Place; selected: boolean }) {
  const { t } = useTranslation();
  const format = useFormat();
  const off = !place.offeringToday;
  const soldOut = place.left === 0 || off;
  return (
    <View style={[styles.pin, selected && styles.selected]}>
      <Text
        font={soldOut ? 'semibold' : 'bold'}
        style={{ fontSize: 13, color: selected ? colors.white : soldOut ? colors.grey : colors.ink }}>
        {off ? t('common.notOfferingTodayShort') : soldOut ? t('common.soldOut') : format.price(place.price)}
      </Text>
    </View>
  );
}

/** Blue dot for the customer's position. */
export function UserDot() {
  return <View style={styles.userDot} />;
}

const styles = StyleSheet.create({
  pin: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  selected: { backgroundColor: colors.green, shadowOpacity: 0.25 },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.userDot,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
