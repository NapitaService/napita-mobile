import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { BagStep, Option, StepTitle } from '@/components/bag-step';
import { Field, Input } from '@/components/form';
import { CheckIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { ALLERGENS, BAG_TYPES, DEFAULT_ALLERGENS, type Allergen } from '@/data/business';
import { useBusiness } from '@/settings/business';
import { colors } from '@/theme';

/** Nueva bolsa, step 1: what goes in the bag. Design: napita-docs/design/canvas/BagStep1Type.dc.html */
export default function BagStepType() {
  const { t } = useTranslation();
  const { draft, updateDraft } = useBusiness();
  const name = draft.customName ?? t(`bagTypes.defaultNames.${draft.type}`);

  const toggleAllergen = (a: Allergen) =>
    updateDraft({
      allergens: draft.allergens.includes(a) ? draft.allergens.filter((x) => x !== a) : [...draft.allergens, a],
    });

  return (
    <BagStep
      step={1}
      buttonLabel={t('newBag.next')}
      onNext={() => router.push('/nueva-bolsa/precio')}
      nextDisabled={!name.trim()}>
      <StepTitle title={t('newBag.typeTitle')} subtitle={t('newBag.typeSubtitle')} />

      <View style={styles.grid} accessibilityRole="radiogroup">
        {BAG_TYPES.map((type) => {
          const selected = type === draft.type;
          return (
            <Option
              key={type}
              selected={selected}
              // Changing the category also updates the suggested allergens.
              onPress={() => updateDraft({ type, allergens: DEFAULT_ALLERGENS[type] })}
              style={styles.type}>
              <View style={styles.typeInner}>
                <Text
                  font={selected ? 'bold' : 'semibold'}
                  style={{ fontSize: 15, flexShrink: 1, color: selected ? colors.green : colors.ink }}>
                  {t(`bagTypes.labels.${type}`)}
                </Text>
                {selected && <CheckIcon size={18} color={colors.green} />}
              </View>
            </Option>
          );
        })}
      </View>

      <Field label={t('newBag.nameLabel')}>
        <Input value={name} onChangeText={(text) => updateDraft({ customName: text })} />
        <Text style={{ fontSize: 13, color: colors.grey }}>{t('newBag.nameHint')}</Text>
      </Field>

      <View style={{ gap: 8 }}>
        <Text font="bold" style={{ fontSize: 14 }}>
          {t('newBag.allergensLabel')}{' '}
          <Text font="medium" style={{ color: colors.grey }}>
            {t('newBag.allergensHint')}
          </Text>
        </Text>
        <View style={styles.chips}>
          {ALLERGENS.map((a) => {
            const on = draft.allergens.includes(a);
            return (
              <Pressable
                key={a}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => toggleAllergen(a)}
                hitSlop={2}
                style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                <Text font="semibold" style={{ fontSize: 14, color: on ? colors.white : colors.ink }}>
                  {t(`allergens.${a}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </BagStep>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  type: { width: '48%', flexGrow: 1, height: 60, borderRadius: 16 },
  typeInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 20, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.ink },
  chipOff: { borderWidth: 1.5, borderColor: colors.chipBorder, backgroundColor: colors.white },
});
