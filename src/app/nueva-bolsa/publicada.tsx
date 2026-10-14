import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/form';
import { ChatIcon, CheckIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { BAG_TINTS } from '@/data/business';
import { formatCOP } from '@/lib/format';
import { useFormat } from '@/lib/use-format';
import { useBusiness } from '@/settings/business';
import { colors } from '@/theme';

/** Nueva bolsa, done. Design: napita-docs/design/canvas/BagPublished.dc.html */
export default function BagPublished() {
  const { t } = useTranslation();
  const format = useFormat();
  const insets = useSafeAreaInsets();
  const { business, bags } = useBusiness();
  const bag = bags[0]; // the bag just published is added first

  const window = format.windowParts(bag.from, bag.to);

  const shareOnWhatsApp = () => {
    const message = t('newBag.shareMessage', {
      name: bag.name,
      business: business.name,
      app: t('app.name'),
      price: formatCOP(bag.price),
      ...window,
    });
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 40 }]}>
        <View style={styles.check}>
          <CheckIcon size={44} color={colors.white} />
        </View>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('newBag.publishedTitle')}
        </Text>
        <Text style={styles.body}>{t('newBag.publishedBody')}</Text>

        <View style={styles.preview}>
          <Text font="bold" style={styles.previewLabel}>
            {t('newBag.customerView').toUpperCase()}
          </Text>
          <View style={styles.card}>
            <View style={[styles.photo, { backgroundColor: BAG_TINTS[bag.type] }]}>
              <Text style={{ fontSize: 13, color: colors.grey }}>{t('newBag.businessPhoto')}</Text>
              <View style={styles.left}>
                <Text font="bold" style={{ fontSize: 12, color: colors.orange }}>
                  {t('common.left', { count: bag.quantity })}
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text font="bold" style={{ fontSize: 16 }}>
                  {business.name}
                </Text>
                <Text style={{ fontSize: 13, color: colors.grey }}>
                  {t(`bagTypes.kinds.${bag.type}`)} · {format.window(bag.from, bag.to)}
                </Text>
              </View>
              <Text font="extrabold" style={{ fontSize: 18, color: colors.green }}>
                {formatCOP(bag.price)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 8 }]}>
        <Pressable accessibilityRole="button" onPress={shareOnWhatsApp} style={styles.share}>
          <ChatIcon size={20} />
          <Text font="bold" style={{ fontSize: 16 }}>
            {t('newBag.shareWhatsApp')}
          </Text>
        </Pressable>
        <PrimaryButton label={t('newBag.done')} onPress={() => router.dismissTo('/bolsas')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', gap: 18 },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 30, lineHeight: 34, letterSpacing: -0.5, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 22, color: colors.grey, textAlign: 'center', maxWidth: 320 },
  preview: { alignSelf: 'stretch', gap: 8, marginTop: 4 },
  previewLabel: { fontSize: 13, letterSpacing: 0.6, color: colors.grey },
  card: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  photo: { height: 110, alignItems: 'center', justifyContent: 'center' },
  left: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  footer: { paddingHorizontal: 20, paddingTop: 14, gap: 10 },
  share: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
