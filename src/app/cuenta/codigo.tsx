import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodeBoxes } from '@/components/code-boxes';
import { BackButton } from '@/components/form';
import { Text } from '@/components/text';
import { formatPhone, useAccount } from '@/settings/account';
import { colors } from '@/theme';

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

  const onChange = (digits: string) => {
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
        <Text style={styles.subtitle}>
          {t('account.codeSubtitle', {
            // Non-breaking spaces keep the number on one line.
            phone: `+57 ${formatPhone(phone)}`.replace(/ /g, '\u00A0'),
          })}
        </Text>
      </View>

      <CodeBoxes
        length={LENGTH}
        value={code}
        onChange={onChange}
        accessibilityLabel={t('account.codeLabel')}
        autoFocus
        oneTimeCode
      />

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
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { fontSize: 15, color: colors.green },
});
