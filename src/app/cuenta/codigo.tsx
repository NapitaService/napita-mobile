import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/form';
import { Text } from '@/components/text';
import { formatPhone, useAccount } from '@/settings/account';
import { colors, fonts } from '@/theme';

const LENGTH = 6;

/**
 * Enter the code sent by WhatsApp/SMS. Confirms by itself on the 6th digit
 * (design principle "Confirm automatically"). Until napita-backend exists any
 * 6 digits are accepted and nothing is really sent.
 */
export default function CodeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { signIn } = useAccount();
  const { phone = '', name = '' } = useLocalSearchParams<{ phone?: string; name?: string }>();
  const [code, setCode] = useState('');
  const input = useRef<TextInput>(null);

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, LENGTH);
    setCode(digits);
    if (digits.length === LENGTH) {
      signIn({ name, phone });
      router.dismissAll();
      router.replace('/descubrir');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />
      <BackButton />

      <View style={{ gap: 6 }}>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('account.codeTitle')}
        </Text>
        <Text style={styles.subtitle}>{t('account.codeSubtitle', {
            // Non-breaking spaces keep the number on one line.
            phone: `+57 ${formatPhone(phone)}`.replace(/ /g, '\u00A0'),
          })}</Text>
      </View>

      <Pressable onPress={() => input.current?.focus()} accessibilityLabel={t('account.codeLabel')}>
        <View style={styles.boxes}>
          {Array.from({ length: LENGTH }, (_, i) => {
            const active = i === code.length;
            return (
              <View key={i} style={[styles.box, active && styles.boxActive]}>
                <Text font="display" style={{ fontSize: 26 }}>
                  {code[i] ?? ''}
                </Text>
              </View>
            );
          })}
        </View>
        {/* One real input behind the boxes, so paste and SMS autofill work. */}
        <TextInput
          ref={input}
          value={code}
          onChangeText={onChange}
          autoFocus
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={LENGTH}
          caretHidden
          style={styles.hiddenInput}
        />
      </Pressable>

      <View style={styles.links}>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert(t('account.resent'))}
          hitSlop={8}
          style={styles.link}>
          <Text font="bold" style={styles.linkText}>
            {t('account.resend')}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.link}>
          <Text font="bold" style={styles.linkText}>
            {t('account.changeNumber')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 22 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.grey },
  boxes: { flexDirection: 'row', gap: 8 },
  box: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.green, borderWidth: 2 },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.01,
    color: 'transparent',
    fontFamily: fonts.regular,
  },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { fontSize: 15, color: colors.green },
});
