import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/text';
import { colors, fonts } from '@/theme';

type Props = {
  length: number;
  value: string;
  onChange: (digits: string) => void;
  accessibilityLabel: string;
  autoFocus?: boolean;
  /** iOS/Android hint to offer the code from an SMS. */
  oneTimeCode?: boolean;
};

/**
 * One box per digit (design/canvas/ShopPickups.dc.html): filled boxes green,
 * the next one dark, empty ones grey. A single hidden input sits behind the
 * boxes so typing, paste and SMS autofill all work.
 */
export function CodeBoxes({ length, value, onChange, accessibilityLabel, autoFocus, oneTimeCode }: Props) {
  const input = useRef<TextInput>(null);

  return (
    <Pressable onPress={() => input.current?.focus()} accessibilityLabel={accessibilityLabel}>
      <View style={styles.boxes}>
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length;
          const next = i === value.length;
          return (
            <View key={i} style={[styles.box, filled ? styles.filled : next ? styles.next : styles.empty]}>
              <Text font="display" style={{ fontSize: 26 }}>
                {value[i] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType={oneTimeCode ? 'oneTimeCode' : 'none'}
        autoComplete={oneTimeCode ? 'sms-otp' : 'off'}
        maxLength={length}
        caretHidden
        accessibilityLabel={accessibilityLabel}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row', gap: 10 },
  box: { flex: 1, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filled: { borderWidth: 2, borderColor: colors.green, backgroundColor: colors.white },
  next: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.white },
  empty: { borderWidth: 1.5, borderColor: colors.chipBorder, backgroundColor: colors.mist },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.01,
    color: 'transparent',
    fontFamily: fonts.regular,
  },
});
