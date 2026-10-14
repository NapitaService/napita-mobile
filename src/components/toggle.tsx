import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
  /** Color when on. Defaults to green; the dark business header uses a lighter green. */
  onColor?: string;
};

/** On/off switch drawn like the canvas (50 × 30). */
export function Toggle({ value, onChange, accessibilityLabel, onColor = colors.green }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={[styles.track, { backgroundColor: value ? onColor : colors.chipBorder }]}>
      <View style={[styles.knob, value ? { right: 3 } : { left: 3 }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 50, height: 30, borderRadius: 15 },
  knob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
});
