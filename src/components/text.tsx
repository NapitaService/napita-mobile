import { Text as RNText, type TextProps } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = TextProps & {
  /** Which font to use. `display` is Bricolage Grotesque for titles and big numbers. */
  font?: keyof typeof fonts;
};

/** Text with the app's default font and color. Use this instead of React Native's Text. */
export function Text({ font = 'regular', style, ...rest }: Props) {
  return <RNText {...rest} style={[{ fontFamily: fonts[font], color: colors.ink }, style]} />;
}
