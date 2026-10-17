import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodeBoxes } from '@/components/code-boxes';
import { CheckIcon, ChevronRightIcon, ScanIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { useFormat } from '@/lib/use-format';
import { isCancelled } from '@/data/sample';
import type { Pickup } from '@/data/business';
import { useHandOver } from '@/lib/use-hand-over';
import { useBusiness } from '@/settings/business';
import { colors } from '@/theme';

const CODE_LENGTH = 4;

/** Entregas. Design: napita-docs/design/canvas/ShopPickups.dc.html, flow: design/flows/entregas.md */
export default function BusinessPickups() {
  const { t } = useTranslation();
  const format = useFormat();
  const insets = useSafeAreaInsets();
  const { business, bags, pickups, cancelByBusiness } = useBusiness();
  const checkCode = useHandOver();
  const [code, setCode] = useState('');

  // Start with empty boxes every time staff come back to this tab.
  useFocusEffect(useCallback(() => setCode(''), []));

  // Confirms by itself on the 4th digit, no button.
  const onCodeChange = (digits: string) => {
    setCode(digits);
    if (digits.length === CODE_LENGTH) checkCode(digits);
  };

  const waiting = pickups.filter((p) => p.status === 'reserved').length;
  // Cancelled orders stay in the list for reference but don't count.
  const total = pickups.filter((p) => !isCancelled(p.status)).length;
  const window = format.window(business.pickupFrom, business.pickupTo);
  const bagName = (bagId: string) => {
    const bag = bags.find((b) => b.id === bagId);
    return bag?.name ?? '';
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />
      <View style={{ gap: 4 }}>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('business.pickups.title')}
        </Text>
        <Text style={{ fontSize: 15, color: colors.grey }}>
          {waiting > 0
            ? t('business.pickups.subtitle', { window, waiting, total })
            : t('business.pickups.allDone', { window })}
        </Text>
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/entrega/escanear')} style={styles.scan}>
        <View style={styles.scanIcon}>
          <ScanIcon size={26} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text font="bold" style={{ fontSize: 17, color: colors.white }}>
            {t('business.pickups.scan')}
          </Text>
          <Text style={{ fontSize: 13, color: colors.white, opacity: 0.8 }}>{t('business.pickups.scanHint')}</Text>
        </View>
        <ChevronRightIcon size={18} color={colors.white} />
      </Pressable>

      <View style={styles.card}>
        <Text font="bold" style={{ fontSize: 15 }}>
          {t('business.pickups.typeCode')}
        </Text>
        <CodeBoxes
          length={CODE_LENGTH}
          value={code}
          onChange={onCodeChange}
          accessibilityLabel={t('business.pickups.codeLabel')}
        />
        <Text style={{ fontSize: 13, color: colors.grey }}>{t('business.pickups.typeHint')}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text font="bold" style={{ fontSize: 16 }}>
          {t('business.pickups.listTitle')}
        </Text>
        <View style={styles.list}>
          {pickups.length === 0 && <Text style={styles.empty}>{t('business.pickups.empty')}</Text>}
          {pickups.map((p, i) => (
            <PickupRow
              key={p.id}
              pickup={p}
              bagName={bagName(p.bagId)}
              last={i === pickups.length - 1}
              onHandOver={() => checkCode(p.code)}
              onCancel={() => cancelByBusiness(p.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/** One order in "Por recoger hoy": hand over, or cancel with a confirmation (decision 0013). */
function PickupRow({
  pickup: p,
  bagName,
  last,
  onHandOver,
  onCancel,
}: {
  pickup: Pickup;
  bagName: string;
  last: boolean;
  onHandOver: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const cancelled = isCancelled(p.status);

  return (
    <View style={[styles.rowWrap, last && { borderBottomWidth: 0 }]}>
      <View style={styles.row}>
        <View style={styles.initial}>
          <Text font="bold" style={{ fontSize: 15, color: cancelled ? colors.grey : colors.ink }}>
            {p.name.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text font="bold" style={{ fontSize: 15, color: cancelled ? colors.grey : colors.ink }}>
            {p.name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.grey }}>
            {t('business.pickups.row', { quantity: p.quantity, kind: bagName })}
          </Text>
        </View>
        {p.status === 'handed_over' ? (
          <View style={styles.done}>
            <CheckIcon size={16} color={colors.green} strokeWidth={2.4} />
            <Text font="bold" style={{ fontSize: 13, color: colors.green }}>
              {t('business.pickups.delivered')}
            </Text>
          </View>
        ) : cancelled ? (
          <Text font="bold" style={{ fontSize: 13, color: colors.grey }}>
            {t('business.pickups.cancelled')}
          </Text>
        ) : (
          !confirming && (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('business.pickups.cancelLabel', { name: p.name })}
                onPress={() => setConfirming(true)}
                hitSlop={4}
                style={styles.cancel}>
                <Text font="bold" style={{ fontSize: 13, color: colors.grey }}>
                  {t('business.pickups.cancel')}
                </Text>
              </Pressable>
              {/* Fallback "by name": hand over without a code. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('business.pickups.handOverLabel', { name: p.name })}
                onPress={onHandOver}
                hitSlop={4}
                style={styles.handOver}>
                <Text font="bold" style={{ fontSize: 13, color: colors.green }}>
                  {t('business.pickups.handOver')}
                </Text>
              </Pressable>
            </View>
          )
        )}
      </View>

      {confirming && (
        <View style={styles.confirm} accessibilityLiveRegion="polite">
          <Text style={{ fontSize: 14, lineHeight: 20 }}>{t('business.pickups.confirmCancel', { name: p.name })}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} style={styles.confirmButton}>
              <Text font="bold" style={{ fontSize: 14 }}>
                {t('business.pickups.keep')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setConfirming(false);
                onCancel();
              }}
              style={[styles.confirmButton, styles.confirmDanger]}>
              <Text font="bold" style={{ fontSize: 14, color: colors.white }}>
                {t('business.pickups.yesCancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  title: { fontSize: 32, letterSpacing: -0.5 },
  scan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.ink,
  },
  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { backgroundColor: colors.white, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  list: { backgroundColor: colors.white, borderRadius: 18, paddingVertical: 2, paddingHorizontal: 14 },
  empty: { fontSize: 14, color: colors.grey, paddingVertical: 14 },
  rowWrap: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cancel: { minHeight: 40, paddingHorizontal: 8, justifyContent: 'center' },
  confirm: { backgroundColor: colors.mist, borderRadius: 14, padding: 12, gap: 10, marginBottom: 10 },
  confirmButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDanger: { backgroundColor: colors.danger, borderColor: colors.danger },
  initial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  handOver: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.green,
    justifyContent: 'center',
  },
});
