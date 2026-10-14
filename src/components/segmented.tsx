import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/text';
import { colors } from '@/theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** Colors for the selected pill, the unselected text and the track. */
  selectedBg?: string;
  selectedText?: string;
  text?: string;
  trackBg?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/** A row of 2+ pill buttons where one is selected (ES/EN, COP/USD, Mapa/Lista…). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  selectedBg = colors.green,
  selectedText = colors.white,
  text = colors.segmentText,
  trackBg = colors.greenTint,
  height = 36,
  style,
}: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: trackBg }, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            hitSlop={4}
            style={[styles.option, { height, backgroundColor: selected ? selectedBg : 'transparent' }]}>
            <Text font="bold" style={{ fontSize: 13, color: selected ? selectedText : text }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 11, padding: 3 },
  option: { paddingHorizontal: 13, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
