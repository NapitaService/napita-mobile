import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { BagStep, Option, StepTitle } from '@/components/bag-step';
import { Text } from '@/components/text';
import { suggestPrices } from '@/data/business';
import { formatCOP } from '@/lib/format';
import { useBusiness } from '@/settings/business';
import { colors, fonts } from '@/theme';

/**
 * Nueva bolsa, step 2: value and price. Design: napita-docs/design/canvas/BagStep2Price.dc.html
 * The design's commission breakdown is left out on purpose (napita-docs/decisions/0007).
 */
export default function BagStepPrice() {
  const { t } = useTranslation();
  const { draft, updateDraft } = useBusiness();
  const prices = draft.value > 0 ? suggestPrices(draft.value) : null;

  const onValueChange = (text: string) => {
    const value = Number(text.replace(/\D/g, '').slice(0, 7)) || 0;
    // A new value means new suggestions; pre-select the middle one again.
    updateDraft({ value, price: value > 0 ? suggestPrices(value)[1] : 0 });
  };

  return (
    <BagStep
      step={2}
      buttonLabel={t('newBag.next')}
      onNext={() => router.push('/nueva-bolsa/horario')}
      nextDisabled={!prices}>
      <StepTitle title={t('newBag.priceTitle')} subtitle={t('newBag.priceSubtitle')} />

      <View style={styles.valueRow}>
        <Text font="display" style={styles.dollar}>
          $
        </Text>
        <TextInput
          value={draft.value > 0 ? formatCOP(draft.value).slice(1) : ''}
          onChangeText={onValueChange}
          keyboardType="number-pad"
          accessibilityLabel={t('newBag.valueLabel')}
          placeholder="0"
          placeholderTextColor={colors.chipBorder}
          style={styles.valueInput}
        />
        <Text font="semibold" style={{ fontSize: 15, color: colors.grey }}>
          COP
        </Text>
      </View>

      {prices && (
        <View style={{ gap: 10 }}>
          <Text font="bold" style={{ fontSize: 15 }}>
            {t('newBag.customerPrice')}
          </Text>
          <View style={styles.prices} accessibilityRole="radiogroup">
            {prices.map((price, i) => {
              const selected = price === draft.price;
              return (
                <Option
                  key={i}
                  selected={selected}
                  onPress={() => updateDraft({ price })}
                  style={styles.price}>
                  <Text
                    font={selected ? 'extrabold' : 'bold'}
                    style={{ fontSize: 16, color: selected ? colors.green : colors.ink, textAlign: 'center' }}>
                    {formatCOP(price)}
                  </Text>
                  {i === 1 && (
                    <Text font="bold" style={[styles.suggested, { color: selected ? colors.green : colors.grey }]}>
                      {t('newBag.suggested').toUpperCase()}
                    </Text>
                  )}
                </Option>
              );
            })}
          </View>
          <Text style={{ fontSize: 13, lineHeight: 18, color: colors.grey }}>{t('newBag.priceHint')}</Text>
        </View>
      )}

    </BagStep>
  );
}

const styles = StyleSheet.create({
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
    paddingBottom: 8,
  },
  dollar: { fontSize: 40, color: colors.grey },
  valueInput: { flex: 1, minWidth: 0, fontFamily: fonts.display, fontSize: 44, color: colors.ink, padding: 0 },
  prices: { flexDirection: 'row', gap: 10 },
  price: { flex: 1, height: 64, borderRadius: 16, alignItems: 'center', paddingHorizontal: 4 },
  suggested: { fontSize: 11, letterSpacing: 0.5, textAlign: 'center', marginTop: 2 },
});
