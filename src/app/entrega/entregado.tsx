import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardIcon, CheckIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { useBusiness } from '@/settings/business';
import { colors } from '@/theme';

/**
 * Handed over. Full-screen green so staff see it at a glance on a busy counter.
 * Design: napita-docs/design/canvas/PickupSuccess.dc.html
 */
export default function PickupSuccess() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pickups, bags, undoHandOver } = useBusiness();

  const pickup = pickups.find((p) => p.id === id);
  const bag = bags.find((b) => b.id === pickup?.bagId);
  const remaining = pickups.filter((p) => p.status === 'reserved').length;

  const backToPickups = () => router.dismissTo('/entregas');
  const undo = () => {
    if (pickup) undoHandOver(pickup.id);
    backToPickups();
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.middle}>
        <View style={styles.check}>
          <CheckIcon size={54} color={colors.green} strokeWidth={2.8} />
        </View>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('business.handedOver.title')}
        </Text>
        {pickup && (
          <View style={{ gap: 4, alignItems: 'center' }}>
            <Text font="bold" style={{ fontSize: 24, color: colors.white }}>
              {pickup.name}
            </Text>
            <Text style={{ fontSize: 17, color: colors.white, opacity: 0.9 }}>
              {pickup.quantity} × {bag?.name}
            </Text>
          </View>
        )}
        <View style={styles.paid}>
          <CardIcon size={20} color={colors.ink} strokeWidth={2} />
          <Text font="bold" style={{ fontSize: 15, flexShrink: 1 }}>
            {t('business.handedOver.paid')}
          </Text>
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Text style={styles.remaining}>
          {remaining > 0
            ? t('business.handedOver.remaining', { count: remaining })
            : t('business.handedOver.noneLeft')}
        </Text>
        <Pressable accessibilityRole="button" onPress={backToPickups} style={styles.next}>
          <Text font="extrabold" style={{ fontSize: 17, color: colors.green }}>
            {t('business.handedOver.next')}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={undo} style={styles.undo}>
          <Text font="semibold" style={{ fontSize: 15, color: colors.white }}>
            {t('business.handedOver.undo')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.green },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 28 },
  check: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 44, lineHeight: 52, letterSpacing: -1, color: colors.white },
  paid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.yellow,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  bottom: { paddingHorizontal: 20, gap: 10 },
  remaining: { textAlign: 'center', fontSize: 14, color: colors.white, opacity: 0.85 },
  next: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undo: { height: 44, alignItems: 'center', justifyContent: 'center' },
});
