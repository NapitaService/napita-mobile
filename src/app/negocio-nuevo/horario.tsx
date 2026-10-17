import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { BagStep, Option, StepTitle } from '@/components/bag-step';
import { Warning } from '@/components/form';
import { InfoIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { HALF_HOURS, nearbyWindows, pickupWindowsFor, windowFits } from '@/data/business';
import { WEEKDAY_INITIALS, weekdayName } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { DEFAULT_HOURS, useAccount, type BusinessType } from '@/settings/account';
import { useSettings } from '@/settings/settings';
import { colors, MIN_TOUCH } from '@/theme';

/**
 * Business sign-up, step 2 of 2: open days, opening hours and the usual pickup
 * window, which must fit inside the hours (decision 0011). Closing time is when
 * orders not picked up become no-shows (decision 0008).
 * Also used from Negocio → "Cambiar horario" (`editar=1`).
 * Design: napita-docs/design/canvas/ShopOnboardHours.dc.html
 */
export default function BusinessHours() {
  const { t } = useTranslation();
  const format = useFormat();
  const { language } = useSettings();
  const { account, saveBusiness } = useAccount();
  const params = useLocalSearchParams<{ name?: string; type?: BusinessType; address?: string; editar?: string }>();
  const editing = params.editar === '1';
  const saved = account?.business;
  const start = (editing && saved) || DEFAULT_HOURS;

  const [openDays, setOpenDays] = useState(start.openDays);
  const [opens, setOpens] = useState(start.opens);
  const [closes, setCloses] = useState(start.closes);
  const [chosen, setChosen] = useState<[string, string]>([start.pickupFrom, start.pickupTo]);
  const [showAll, setShowAll] = useState(false);

  const windows = pickupWindowsFor(opens, closes);
  // If new hours leave the chosen window outside, use the last hour before closing.
  const pickup = windowFits(chosen[0], chosen[1], opens, closes) ? chosen : windows[windows.length - 1];
  const shown = showAll ? windows : nearbyWindows(windows, pickup?.[0] ?? '', 4);

  const tooShort = windows.length === 0;
  const noDays = openDays.length === 0;

  const toggleDay = (day: number) =>
    setOpenDays(openDays.includes(day) ? openDays.filter((d) => d !== day) : [...openDays, day].sort());

  const finish = () => {
    if (tooShort || noDays || !pickup) return;
    const hours = { openDays, opens, closes, pickupFrom: pickup[0], pickupTo: pickup[1] };
    if (editing && saved) {
      saveBusiness({ ...saved, ...hours });
      router.back();
      return;
    }
    saveBusiness({
      name: params.name ?? '',
      type: params.type ?? 'other',
      address: params.address ?? '',
      ...hours,
    });
    router.dismissAll();
    router.replace('/hoy');
  };

  return (
    <BagStep
      step={2}
      total={2}
      heading={editing ? t('signup.editHeading') : t('signup.heading')}
      buttonLabel={editing ? t('signup.save') : t('signup.create')}
      onNext={finish}
      nextDisabled={tooShort || noDays}>
      <StepTitle title={t('signup.hoursTitle')} subtitle={t('signup.hoursSubtitle')} />

      <View style={{ gap: 10 }}>
        <Text font="bold" style={{ fontSize: 14 }}>
          {t('signup.days')}
        </Text>
        <View style={styles.days} accessibilityLabel={t('signup.days')}>
          {WEEKDAY_INITIALS[language].map((initial, day) => {
            const on = openDays.includes(day);
            return (
              <Pressable
                key={day}
                accessibilityRole="checkbox"
                accessibilityLabel={weekdayName(day, language)}
                accessibilityState={{ checked: on }}
                onPress={() => toggleDay(day)}
                style={[styles.day, on ? styles.dayOn : styles.dayOff]}>
                <Text font="bold" style={{ fontSize: 15, color: on ? colors.white : colors.ink }}>
                  {initial}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {noDays && <Warning text={t('signup.noDays')} />}
      </View>

      <View style={{ gap: 10 }}>
        <Text font="bold" style={{ fontSize: 14 }}>
          {t('signup.openingHours')}
        </Text>
        <View style={styles.hoursBox}>
          <TimeStepper label={t('signup.opens')} value={opens} onChange={setOpens} />
          <View style={styles.divider} />
          <TimeStepper label={t('signup.closes')} value={closes} onChange={setCloses} />
        </View>
        {tooShort ? (
          <Warning text={t('signup.tooShort')} />
        ) : (
          <Text style={styles.hint}>{t('signup.closesHint', { time: format.time(closes) })}</Text>
        )}
      </View>

      {!tooShort && (
        <View style={{ gap: 10 }}>
          <Text font="bold" style={{ fontSize: 14 }}>
            {t('signup.pickupWindow')}
          </Text>
          <View style={styles.grid} accessibilityRole="radiogroup">
            {shown.map(([from, to]) => (
              <Option
                key={from}
                label={format.window(from, to)}
                selected={pickup?.[0] === from}
                onPress={() => setChosen([from, to])}
                style={styles.gridItem}
              />
            ))}
          </View>
          {!showAll && windows.length > shown.length && (
            <Pressable accessibilityRole="button" onPress={() => setShowAll(true)} style={styles.more}>
              <Text font="semibold" style={{ fontSize: 15 }}>
                {t('signup.otherWindow')}
              </Text>
            </Pressable>
          )}
          <Text style={styles.hint}>{t('signup.pickupHint')}</Text>
        </View>
      )}

      {!editing && (
        <View style={styles.info}>
          <InfoIcon size={22} color={colors.green} />
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.segmentText }}>
            {t('signup.paymentsLater')}
          </Text>
        </View>
      )}
    </BagStep>
  );
}

/** "Abre  − 7:00 a. m. +" in 30-minute steps. */
function TimeStepper({ label, value, onChange }: { label: string; value: string; onChange: (time: string) => void }) {
  const { t } = useTranslation();
  const format = useFormat();
  const at = HALF_HOURS.indexOf(value);
  return (
    <View style={styles.stepperRow}>
      <Text font="semibold" style={{ fontSize: 15, flex: 1 }}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('signup.earlier', { label })}
        disabled={at <= 0}
        onPress={() => onChange(HALF_HOURS[at - 1])}
        style={[styles.round, at <= 0 && { opacity: 0.4 }]}>
        <Text font="bold" style={{ fontSize: 20 }}>
          −
        </Text>
      </Pressable>
      <Text font="bold" style={styles.time} accessibilityLiveRegion="polite">
        {format.time(value)}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('signup.later', { label })}
        disabled={at >= HALF_HOURS.length - 1}
        onPress={() => onChange(HALF_HOURS[at + 1])}
        style={[styles.round, at >= HALF_HOURS.length - 1 && { opacity: 0.4 }]}>
        <Text font="bold" style={{ fontSize: 20 }}>
          +
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: colors.green },
  dayOff: { borderWidth: 1.5, borderColor: colors.chipBorder, backgroundColor: colors.white },
  hoursBox: { backgroundColor: colors.mist, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: colors.border },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 60 },
  round: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    borderWidth: 1.5,
    borderColor: colors.dashed,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { width: 92, textAlign: 'center', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '48%', minHeight: 52, borderRadius: 14, alignItems: 'center' },
  more: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 13, lineHeight: 18, color: colors.grey },
  info: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 14,
  },
});
