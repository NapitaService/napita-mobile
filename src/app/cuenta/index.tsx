import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Field, Input, PhoneInput, PrimaryButton } from '@/components/form';
import { Text } from '@/components/text';
import { cleanPhone, isEarlyProblem, PHONE_LENGTH, phoneProblem } from '@/lib/phone';
import { formatPhone, useAccount } from '@/settings/account';
import { colors } from '@/theme';

/**
 * Crea tu cuenta (customer or business) / Inicia sesión. Everyone signs in with
 * celular + code only, and the account type is chosen here, once (decision 0005).
 * Design: napita-docs/design/canvas/AccountCreate.dc.html
 */
export default function AccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { findAccount } = useAccount();
  const { modo, tipo } = useLocalSearchParams<{ modo?: 'crear' | 'entrar'; tipo?: 'cliente' | 'negocio' }>();
  const creating = modo !== 'entrar';
  const forBusiness = tipo === 'negocio';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Show "missing digits" / empty warnings only once the person is done typing.
  const [phoneDone, setPhoneDone] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const problem = phoneProblem(phone);
  const nameMissing = creating && !forBusiness && !name.trim();
  const showPhoneProblem = problem !== null && (isEarlyProblem(problem) || phoneDone || triedSubmit);
  // One account per number: creating needs a new one, signing in a known one.
  const existing = problem === null ? findAccount(phone) : undefined;
  const accountProblem =
    problem !== null ? null : creating ? (existing ? 'taken' : null) : existing ? null : 'unknown';

  const phoneWarning = !showPhoneProblem
    ? accountProblem === 'taken'
      ? t('account.phoneTaken')
      : accountProblem === 'unknown' && (phoneDone || triedSubmit)
        ? t('account.phoneUnknown')
        : null
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
    if (problem !== null || nameMissing || accountProblem !== null) return;
    router.push({
      pathname: '/cuenta/codigo',
      params: creating ? { phone, name: name.trim(), tipo: forBusiness ? 'negocio' : 'cliente' } : { phone },
    });
  };

  // From sign-in, "Crea una" goes back to Welcome to choose customer or business.
  const switchMode = () =>
    creating ? router.setParams({ modo: 'entrar' }) : router.canGoBack() ? router.back() : router.replace('/');

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
            {!creating ? t('account.signInTitle') : forBusiness ? t('account.businessTitle') : t('account.createTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {!creating
              ? t('account.signInSubtitle')
              : forBusiness
                ? t('account.businessSubtitle')
                : t('account.createSubtitle')}
          </Text>
        </View>

        {creating && !forBusiness && (
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

        <Field label={forBusiness ? t('account.businessPhone') : t('account.phone')} warning={phoneWarning}>
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
