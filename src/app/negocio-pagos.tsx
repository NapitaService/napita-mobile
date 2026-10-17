import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Option } from '@/components/bag-step';
import { BackButton, Field, Input, PhoneInput, PrimaryButton } from '@/components/form';
import { InfoIcon } from '@/components/icons';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { BANKS, type DocumentType, type PayoutAccount } from '@/data/business';
import { cleanPhone, phoneProblem } from '@/lib/phone';
import { formatPhone, useAccount } from '@/settings/account';
import { colors } from '@/theme';

const digitsOnly = (text: string, max: number) => text.replace(/\D/g, '').slice(0, max);

/**
 * Cuenta para recibir pagos: a bank account or Nequi where Ñapita sends the
 * business's money (decision 0015). Opened from Negocio.
 * Design: napita-docs/design/canvas/ShopPayout.dc.html
 */
export default function PayoutAccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { account, saveBusiness } = useAccount();
  const business = account?.business;
  const saved = business?.payout;

  const [method, setMethod] = useState<PayoutAccount['method']>(saved?.method ?? 'bank');
  const [bank, setBank] = useState(saved?.method === 'bank' ? saved.bank : '');
  const [accountType, setAccountType] = useState<'savings' | 'checking'>(
    saved?.method === 'bank' ? saved.accountType : 'savings',
  );
  const [accountNumber, setAccountNumber] = useState(saved?.method === 'bank' ? saved.accountNumber : '');
  const [nequiPhone, setNequiPhone] = useState(saved?.method === 'nequi' ? saved.phone : (account?.phone ?? ''));
  const [holderName, setHolderName] = useState(saved?.holderName ?? '');
  const [documentType, setDocumentType] = useState<DocumentType>(saved?.documentType ?? 'cc');
  const [documentNumber, setDocumentNumber] = useState(saved?.documentNumber ?? '');
  const [tried, setTried] = useState(false);

  const problems = {
    bank: method === 'bank' && !bank,
    accountNumber: method === 'bank' && (accountNumber.length < 6 || accountNumber.length > 20),
    nequiPhone: method === 'nequi' && phoneProblem(nequiPhone) !== null,
    holderName: !holderName.trim(),
    documentNumber: documentNumber.length < 5 || documentNumber.length > 12,
  };
  const show = (key: keyof typeof problems) => tried && problems[key];

  const save = () => {
    setTried(true);
    if (!business || Object.values(problems).some(Boolean)) return;
    // A new or changed account is checked with a $300 test transfer (decision 0015).
    const owner = { holderName: holderName.trim(), documentType, documentNumber, status: 'verifying' as const };
    const payout: PayoutAccount =
      method === 'bank'
        ? { method, bank, accountType, accountNumber, ...owner }
        : { method, phone: nequiPhone, ...owner };
    saveBusiness({ ...business, payout });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled">
        <BackButton />
        <View style={{ gap: 6 }}>
          <Text font="display" style={styles.title} accessibilityRole="header">
            {t('payout.title')}
          </Text>
          <Text style={styles.subtitle}>{t('payout.subtitle')}</Text>
        </View>

        <Segmented
          accessibilityLabel={t('payout.methodLabel')}
          options={[
            { value: 'bank', label: t('payout.bank') },
            { value: 'nequi', label: t('payout.nequi') },
          ]}
          value={method}
          onChange={setMethod}
          height={44}
        />

        {method === 'bank' ? (
          <>
            <Field label={t('payout.bankLabel')} warning={show('bank') ? t('payout.bankMissing') : null}>
              <View style={styles.wrap} accessibilityRole="radiogroup">
                {BANKS.map((name) => (
                  <Option key={name} label={name} selected={bank === name} onPress={() => setBank(name)} />
                ))}
              </View>
            </Field>
            <Field label={t('payout.accountType')}>
              <Segmented
                accessibilityLabel={t('payout.accountType')}
                options={[
                  { value: 'savings', label: t('payout.savings') },
                  { value: 'checking', label: t('payout.checking') },
                ]}
                value={accountType}
                onChange={setAccountType}
                height={40}
              />
            </Field>
            <Field
              label={t('payout.accountNumber')}
              warning={show('accountNumber') ? t('payout.accountNumberInvalid') : null}>
              <Input
                invalid={show('accountNumber')}
                value={accountNumber}
                onChangeText={(text) => setAccountNumber(digitsOnly(text, 20))}
                keyboardType="number-pad"
                placeholder={t('payout.accountNumberPlaceholder')}
              />
            </Field>
          </>
        ) : (
          <Field label={t('payout.nequiPhone')} warning={show('nequiPhone') ? t('payout.nequiPhoneInvalid') : null}>
            <PhoneInput
              invalid={show('nequiPhone')}
              value={formatPhone(nequiPhone)}
              onChangeText={(text) => setNequiPhone(cleanPhone(text))}
              placeholder="300 000 0000"
            />
          </Field>
        )}

        <Field label={t('payout.holderName')} warning={show('holderName') ? t('payout.holderNameMissing') : null}>
          <Input
            invalid={show('holderName')}
            value={holderName}
            onChangeText={setHolderName}
            placeholder={t('payout.holderNamePlaceholder')}
            autoCapitalize="words"
          />
        </Field>

        <Field label={t('payout.document')} warning={show('documentNumber') ? t('payout.documentInvalid') : null}>
          <Segmented
            accessibilityLabel={t('payout.documentType')}
            options={[
              { value: 'cc', label: 'CC' },
              { value: 'ce', label: 'CE' },
              { value: 'nit', label: 'NIT' },
            ]}
            value={documentType}
            onChange={setDocumentType}
            height={40}
            style={{ alignSelf: 'flex-start' }}
          />
          <Input
            invalid={show('documentNumber')}
            value={documentNumber}
            onChangeText={(text) => setDocumentNumber(digitsOnly(text, 12))}
            keyboardType="number-pad"
            placeholder={t('payout.documentPlaceholder')}
          />
        </Field>

        <View style={styles.info}>
          <InfoIcon size={22} color={colors.green} />
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.segmentText }}>{t('payout.info')}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 8 }]}>
        <PrimaryButton label={t('payout.save')} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 18 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.grey },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  info: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 14,
  },
  footer: {
    paddingTop: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
