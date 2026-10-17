import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { BagImage } from '@/components/bag-image';
import { Text } from '@/components/text';
import { pickImage } from '@/lib/pick-image';
import { colors } from '@/theme';

/** Square logo with "Agregar logo" / "Cambiar logo". Used at sign-up and in Negocio. */
export function LogoPicker({
  logo,
  businessName,
  onChange,
}: {
  logo?: string;
  businessName: string;
  onChange: (logo: string | undefined) => void;
}) {
  const { t } = useTranslation();
  const choose = async () => {
    const uri = await pickImage([1, 1]);
    if (uri) onChange(uri);
  };
  return (
    <View style={styles.row}>
      <BagImage logo={logo} businessName={businessName || '+'} tint={colors.mist} style={styles.logo} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Pressable accessibilityRole="button" onPress={choose} style={styles.button}>
            <Text font="bold" style={{ fontSize: 14, color: colors.green }}>
              {logo ? t('signup.changeLogo') : t('signup.addLogo')}
            </Text>
          </Pressable>
          {logo && (
            <Pressable accessibilityRole="button" onPress={() => onChange(undefined)} style={styles.remove}>
              <Text font="semibold" style={{ fontSize: 14, color: colors.grey }}>
                {t('signup.removeLogo')}
              </Text>
            </Pressable>
          )}
        </View>
        <Text style={{ fontSize: 13, lineHeight: 18, color: colors.grey }}>{t('signup.logoHint')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 76, height: 76, borderRadius: 18, borderWidth: 1.5, borderColor: colors.chipBorder },
  button: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.greenTint,
    justifyContent: 'center',
  },
  remove: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
});
