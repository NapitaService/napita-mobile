import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/text';
import { colors } from '@/theme';

type Props = {
  /** The bag's first photo, if the business added one. */
  photo?: string;
  /** The business's logo, shown when the bag has no photo. */
  logo?: string;
  /** Used for the initial when there's neither photo nor logo. */
  businessName: string;
  /** Background color for the logo or initial. */
  tint: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A bag's picture everywhere it appears: the bag photo, otherwise the
 * business's logo, otherwise its initial, so it's never blank
 * (napita-docs/decisions/0013).
 */
export function BagImage({ photo, logo, businessName, tint, style }: Props) {
  if (photo) {
    return (
      <View style={[styles.box, style]}>
        <Image
          source={{ uri: photo }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }
  if (logo) {
    return (
      <View style={[styles.box, { backgroundColor: tint }, style]}>
        <Image source={{ uri: logo }} style={styles.logo} contentFit="contain" accessibilityIgnoresInvertColors />
      </View>
    );
  }
  return (
    <View style={[styles.box, styles.center, { backgroundColor: tint }, style]}>
      <Text font="display" style={styles.initial}>
        {businessName.trim().charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: '70%', height: '70%', alignSelf: 'center', marginTop: '15%' },
  initial: { fontSize: 26, color: colors.ink, opacity: 0.55 },
});
