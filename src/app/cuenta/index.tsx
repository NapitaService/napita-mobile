import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Field, Input, PhoneInput, PrimaryButton } from '@/components/form';
import { Text } from '@/components/text';
import { cleanPhone, isEarlyProblem, PHONE_LENGTH, phoneProblem } from '@/lib/phone';
import { formatPhone } from '@/settings/account';
import { colors } from '@/theme';

/**
 * Crea tu cuenta / Inicia sesión. Not in the design canvas yet. Everyone signs in
 * with celular + code only (napita-docs/decisions/0005-phone-only-sign-in.md).
 * Styling follows ShopOnboardDetails.dc.html.
 */
export default function AccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { modo } = useLocalSearchParams<{ modo?: 'crear' | 'entrar' }>();
  const creating = modo !== 'entrar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Show "missing digits" / empty warnings only once the person is done typing.
  const [phoneDone, setPhoneDone] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const problem = phoneProblem(phone);
  const nameMissing = creating && !name.trim();
  const showPhoneProblem = problem !== null && (isEarlyProblem(problem) || phoneDone || triedSubmit);

  const phoneWarning = !showPhoneProblem
    ? null
    : problem === 'landline'
      ? t('account.phoneLandline')
      : problem === 'notMobile'
        ? t('account.phoneNotMobile')
        : problem === 'unknownPrefix'
          ? t('account.phoneUnknownPrefix')
          : problem === 'tooShort'
            ? t('account.phoneTooShort', { count: PHONE_LENGTH - phone.length })
            : t('account.phoneEmpty');

  const sendCode = () => {
    setTriedSubmit(true);
    if (problem !== null || nameMissing) return;
    router.push({ pathname: '/cuenta/codigo', params: { phone, name: creating ? name.trim() : '' } });
  };

  const switchMode = () => router.setParams({ modo: creating ? 'entrar' : 'crear' });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled">
        <BackButton />

        <View style={{ gap: 6 }}>
          <Text font="display" style={styles.title} accessibilityRole="header">
            {creating ? t('account.createTitle') : t('account.signInTitle')}
          </Text>
          <Text style={styles.subtitle}>{creating ? t('account.createSubtitle') : t('account.signInSubtitle')}</Text>
        </View>

        {creating && (
          <Field label={t('account.name')} warning={triedSubmit && nameMissing ? t('account.nameMissing') : null}>
            <Input
              invalid={triedSubmit && nameMissing}
              value={name}
              onChangeText={setName}
              placeholder={t('account.namePlaceholder')}
              textContentType="givenName"
              autoComplete="name-given"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>
        )}

        <Field label={t('account.phone')} warning={phoneWarning}>
          <PhoneInput
            invalid={!!phoneWarning}
            value={formatPhone(phone)}
            onChangeText={(text) => {
              setPhone(cleanPhone(text));
              setPhoneDone(false);
            }}
            onBlur={() => setPhoneDone(phone.length > 0)}
            placeholder={t('account.phonePlaceholder')}
            returnKeyType="done"
            onSubmitEditing={sendCode}
          />
        </Field>

        <PrimaryButton label={t('account.sendCode')} onPress={sendCode} />

        <View style={styles.switchRow}>
          <Text style={{ fontSize: 15, color: colors.grey }}>
            {creating ? t('account.haveAccount') : t('account.noAccount')}{' '}
          </Text>
          <Pressable accessibilityRole="link" onPress={switchMode} hitSlop={12}>
            <Text font="bold" style={{ fontSize: 15, color: colors.green }}>
              {creating ? t('account.signIn') : t('account.createOne')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, gap: 18 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.grey },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 44 },
});
