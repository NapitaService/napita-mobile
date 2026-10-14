import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/form';
import { ChevronLeftIcon, CloseIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { colors, MIN_TOUCH } from '@/theme';

type Props = {
  step: 1 | 2 | 3;
  buttonLabel: string;
  onNext: () => void;
  nextDisabled?: boolean;
  children: ReactNode;
};

/**
 * Frame shared by the "Nueva bolsa" steps (design/canvas/BagStep1Type…3Schedule):
 * close/back button, "1 de 3", progress bar, and the button pinned at the bottom.
 */
export function BagStep({ step, buttonLabel, onNext, nextDisabled, children }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={step === 1 ? t('newBag.close') : t('newBag.back')}
            onPress={() => router.back()}
            style={styles.round}>
            {step === 1 ? <CloseIcon size={18} /> : <ChevronLeftIcon size={20} />}
          </Pressable>
          <Text font="bold" style={{ fontSize: 15 }}>
            {t('newBag.title')}
          </Text>
          <Text style={styles.stepText}>{t('newBag.step', { step })}</Text>
        </View>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 8 }]}>
        <PrimaryButton label={buttonLabel} onPress={onNext} disabled={nextDisabled} />
      </View>
    </KeyboardAvoidingView>
  );
}

export function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text font="display" style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

/** A choice button that shows green when selected (bag type, price, pickup time). */
export function Option({
  label,
  selected,
  onPress,
  style,
  children,
}: {
  label?: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected ? styles.optionOn : styles.optionOff, style]}>
      {children ?? (
        <Text font={selected ? 'bold' : 'semibold'} style={{ fontSize: 14, color: selected ? colors.green : colors.ink }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  top: { paddingHorizontal: 20, gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  round: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { width: MIN_TOUCH, textAlign: 'right', fontSize: 14, color: colors.grey },
  progress: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.green },
  content: { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 24, gap: 20 },
  footer: {
    paddingTop: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  title: { fontSize: 28, lineHeight: 32, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.grey },
  option: { minHeight: MIN_TOUCH, borderRadius: 22, paddingHorizontal: 14, justifyContent: 'center' },
  optionOn: { borderWidth: 2, borderColor: colors.green, backgroundColor: colors.selectedTint },
  optionOff: { borderWidth: 1.5, borderColor: colors.chipBorder, backgroundColor: colors.white },
});
