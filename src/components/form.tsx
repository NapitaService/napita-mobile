import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { colors, fonts, MIN_TOUCH } from '@/theme';

// Form pieces styled like napita-docs/design/canvas/ShopOnboardDetails.dc.html.

/** Round back button; goes to the Welcome screen when there's nowhere to go back to. */
export function BackButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('account.back')}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={styles.back}>
      <ChevronLeftIcon size={20} />
    </Pressable>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text font="bold" style={{ fontSize: 14 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.grey} {...props} style={[styles.input, props.style]} />;
}

/** Celular with the fixed +57 box in front. */
export function PhoneInput(props: TextInputProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={styles.prefix}>
        <Text font="semibold" style={{ fontSize: 16 }}>
          +57
        </Text>
      </View>
      <Input keyboardType="phone-pad" textContentType="telephoneNumber" autoComplete="tel" {...props} style={{ flex: 1 }} />
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.primary, disabled && { opacity: 0.4 }]}>
      <Text font="bold" style={{ fontSize: 17, color: colors.white }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
    minWidth: 0,
  },
  prefix: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.mist,
    justifyContent: 'center',
  },
  primary: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
