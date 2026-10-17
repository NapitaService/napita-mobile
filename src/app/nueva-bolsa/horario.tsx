import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { BagStep, Option, StepTitle } from '@/components/bag-step';
import { Text } from '@/components/text';
import { Toggle } from '@/components/toggle';
import { nearbyWindows, pickupWindowsFor } from '@/data/business';
import { formatCOP, formatDays, WEEKDAY_INITIALS, weekdayName } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { useBusiness } from '@/settings/business';
import { useSettings } from '@/settings/settings';
import { colors, MIN_TOUCH } from '@/theme';

/**
 * Nueva bolsa, step 3: how many and when. Pickup times and days stay inside the
 * business's opening hours (decision 0011).
 * Design: napita-docs/design/canvas/BagStep3Schedule.dc.html
 */
export default function BagStepSchedule() {
  const { t } = useTranslation();
  const format = useFormat();
  const { language } = useSettings();
  const { business, draft, updateDraft, publishDraft } = useBusiness();

  const allWindows = pickupWindowsFor(business.opens, business.closes);
  const isSelected = ([from, to]: [string, string]) => from === draft.from && to === draft.to;
  // Three windows around the business's usual one; "Otro" shows every window inside the hours.
  const [showMore, setShowMore] = useState(false);
  const windows = showMore ? allWindows : nearbyWindows(allWindows, business.pickupFrom, 3);
  if (!showMore && !windows.some(isSelected) && allWindows.some(isSelected)) setShowMore(true);

  const toggleDay = (day: number) =>
    updateDraft({ days: draft.days.includes(day) ? draft.days.filter((d) => d !== day) : [...draft.days, day] });

  const window = format.windowParts(draft.from, draft.to);
  const summary = draft.repeatWeekly
    ? t('newBag.summaryRepeat', {
        count: draft.quantity,
        price: formatCOP(draft.price),
        ...window,
        days: formatDays(draft.days, language, true),
      })
    : t('newBag.summaryToday', { count: draft.quantity, price: formatCOP(draft.price), ...window });

  const canPublish = !draft.repeatWeekly || draft.days.length > 0;

  const publish = () => {
    publishDraft(draft.customName?.trim() || t(`bagTypes.defaultNames.${draft.type}`));
    router.replace('/nueva-bolsa/publicada');
  };

  return (
    <BagStep step={3} buttonLabel={t('newBag.publish')} onNext={publish} nextDisabled={!canPublish}>
      <StepTitle title={t('newBag.scheduleTitle')} />

      <View style={styles.quantityBox}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text font="bold" style={{ fontSize: 16 }}>
            {t('newBag.quantityLabel')}
          </Text>
          <Text style={{ fontSize: 13, color: colors.grey }}>{t('newBag.quantityHint')}</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('newBag.oneLess')}
            disabled={draft.quantity <= 1}
            onPress={() => updateDraft({ quantity: draft.quantity - 1 })}
            style={[styles.minus, draft.quantity <= 1 && { opacity: 0.4 }]}>
            <Text font="bold" style={{ fontSize: 22 }}>
              −
            </Text>
          </Pressable>
          <Text font="display" style={styles.quantity}>
            {draft.quantity}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('newBag.oneMore')}
            disabled={draft.quantity >= 50}
            onPress={() => updateDraft({ quantity: draft.quantity + 1 })}
            style={styles.plus}>
            <Text font="bold" style={{ fontSize: 22, color: colors.white }}>
              +
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text font="bold" style={{ fontSize: 15 }}>
          {t('newBag.windowLabel')}
        </Text>
        <View style={styles.wrap} accessibilityRole="radiogroup">
          {windows.map(([from, to]) => (
            <Option
              key={from}
              label={format.window(from, to)}
              selected={isSelected([from, to])}
              onPress={() => updateDraft({ from, to })}
            />
          ))}
          {!showMore && <Option label={t('newBag.other')} selected={false} onPress={() => setShowMore(true)} />}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <View style={styles.repeatRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text font="bold" style={{ fontSize: 15 }}>
              {t('newBag.repeatLabel')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.grey }}>{t('newBag.repeatHint')}</Text>
          </View>
          <Toggle
            value={draft.repeatWeekly}
            onChange={(repeatWeekly) => updateDraft({ repeatWeekly })}
            accessibilityLabel={t('newBag.repeatLabel')}
          />
        </View>
        {draft.repeatWeekly && (
          <View style={styles.days} accessibilityLabel={t('newBag.daysLabel')}>
            {WEEKDAY_INITIALS[language].map((initial, day) => {
              const on = draft.days.includes(day);
              // Days the business is closed can't be chosen.
              const closed = !business.openDays.includes(day);
              return (
                <Pressable
                  key={day}
                  accessibilityRole="checkbox"
                  accessibilityLabel={weekdayName(day, language)}
                  accessibilityState={{ checked: on, disabled: closed }}
                  disabled={closed}
                  onPress={() => toggleDay(day)}
                  style={[styles.day, on ? styles.dayOn : styles.dayOff, closed && { opacity: 0.35 }]}>
                  <Text font="bold" style={{ fontSize: 15, color: on ? colors.white : colors.ink }}>
                    {initial}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {canPublish && (
        <View style={styles.summary}>
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.segmentText }}>
            <Text font="bold">{t('newBag.summaryLabel')}</Text> {summary}
          </Text>
        </View>
      )}
    </BagStep>
  );
}

const styles = StyleSheet.create({
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.mist,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  minus: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    borderWidth: 1.5,
    borderColor: colors.dashed,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: { width: 40, textAlign: 'center', fontSize: 30 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  repeatRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  summary: { backgroundColor: colors.summary, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14 },
});
