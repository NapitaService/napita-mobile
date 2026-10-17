import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { BagStep, Option, StepTitle } from '@/components/bag-step';
import { Field, Input } from '@/components/form';
import { CheckIcon, CloseIcon, PlusIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { BagImage } from '@/components/bag-image';
import { ALLERGENS, BAG_TINTS, BAG_TYPES_FOR, DEFAULT_ALLERGENS, MAX_BAG_PHOTOS, type Allergen } from '@/data/business';
import { pickImage } from '@/lib/pick-image';
import { useBusiness } from '@/settings/business';
import { colors } from '@/theme';

/**
 * Nueva bolsa, step 1: what goes in the bag, with options for this type of
 * business, and optional photos (decision 0013).
 * Design: napita-docs/design/canvas/BagStep1Type.dc.html
 */
export default function BagStepType() {
  const { t } = useTranslation();
  const { business, draft, updateDraft } = useBusiness();
  const types = BAG_TYPES_FOR[business.type];

  const addPhoto = async () => {
    const uri = await pickImage([4, 3]);
    if (uri) updateDraft({ photos: [...draft.photos, uri].slice(0, MAX_BAG_PHOTOS) });
  };
  const removePhoto = (i: number) => updateDraft({ photos: draft.photos.filter((_, j) => j !== i) });
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
        {types.map((type) => {
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

      <View style={{ gap: 8 }}>
        <Text font="bold" style={{ fontSize: 14 }}>
          {t('newBag.photosLabel')}{' '}
          <Text font="medium" style={{ color: colors.grey }}>
            {t('newBag.photosOptional')}
          </Text>
        </Text>
        <View style={styles.photos}>
          {draft.photos.map((uri, i) => (
            <View key={uri}>
              <BagImage photo={uri} businessName={business.name} tint={BAG_TINTS[draft.type]} style={styles.photo} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('newBag.removePhoto', { number: i + 1 })}
                onPress={() => removePhoto(i)}
                hitSlop={10}
                style={styles.removePhoto}>
                <CloseIcon size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {draft.photos.length === 0 && (
            <BagImage
              logo={business.logo}
              businessName={business.name}
              tint={BAG_TINTS[draft.type]}
              style={styles.photo}
            />
          )}
          {draft.photos.length < MAX_BAG_PHOTOS && (
            <Pressable accessibilityRole="button" onPress={addPhoto} style={[styles.photo, styles.addPhoto]}>
              <PlusIcon size={22} color={colors.green} />
              <Text font="bold" style={{ fontSize: 12, color: colors.green }}>
                {t('newBag.addPhoto')}
              </Text>
            </Pressable>
          )}
        </View>
        <Text style={{ fontSize: 13, lineHeight: 18, color: colors.grey }}>
          {business.logo ? t('newBag.photosHint') : t('newBag.photosHintNoLogo')}
        </Text>
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
  photos: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  photo: { width: 96, height: 72, borderRadius: 14 },
  addPhoto: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.dashed,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 20, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.ink },
  chipOff: { borderWidth: 1.5, borderColor: colors.chipBorder, backgroundColor: colors.white },
});
