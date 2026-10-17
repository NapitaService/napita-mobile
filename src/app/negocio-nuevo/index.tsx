import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BagStep, Option, StepTitle } from '@/components/bag-step';
import { Field, Input } from '@/components/form';
import { LogoPicker } from '@/components/logo-picker';
import { Text } from '@/components/text';
import { BUSINESS_TYPES, type BusinessType } from '@/data/business';
import { formatPhone, useAccount } from '@/settings/account';
import { colors } from '@/theme';

/**
 * Business sign-up, step 1 of 2: name, logo, type and address. Comes right after the
 * code, so the celular is already known (it's the login and the contact number).
 * Design: napita-docs/design/canvas/ShopOnboardDetails.dc.html
 */
export default function BusinessDetails() {
  const { t } = useTranslation();
  const { account, signOut } = useAccount();
  const [name, setName] = useState(account?.business?.name ?? '');
  const [type, setType] = useState<BusinessType>(account?.business?.type ?? 'bakery');
  const [address, setAddress] = useState(account?.business?.address ?? '');
  const [logo, setLogo] = useState(account?.business?.logo);
  const [tried, setTried] = useState(false);

  const nameMissing = !name.trim();
  const addressMissing = !address.trim();

  const next = () => {
    setTried(true);
    if (nameMissing || addressMissing) return;
    router.push({
      pathname: '/negocio-nuevo/horario',
      params: { name: name.trim(), type, address: address.trim(), ...(logo ? { logo } : {}) },
    });
  };

  // Leaving sign-up logs out; signing in again with this celular comes back here.
  const leave = () => {
    signOut();
    router.dismissAll();
    router.replace('/');
  };

  return (
    <BagStep
      step={1}
      total={2}
      heading={t('signup.heading')}
      onBack={leave}
      buttonLabel={t('signup.continue')}
      onNext={next}>
      <StepTitle title={t('signup.detailsTitle')} subtitle={t('signup.detailsSubtitle')} />

      <Field label={t('signup.name')} warning={tried && nameMissing ? t('signup.nameMissing') : null}>
        <Input
          invalid={tried && nameMissing}
          value={name}
          onChangeText={setName}
          placeholder={t('signup.namePlaceholder')}
          autoCapitalize="words"
        />
      </Field>

      <View style={{ gap: 8 }}>
        <Text font="bold" style={{ fontSize: 14 }}>
          {t('signup.logo')}
        </Text>
        <LogoPicker logo={logo} businessName={name} onChange={setLogo} />
      </View>

      <View style={{ gap: 8 }}>
        <Text font="bold" style={{ fontSize: 14 }}>
          {t('signup.typeLabel')}
        </Text>
        <View style={styles.wrap} accessibilityRole="radiogroup">
          {BUSINESS_TYPES.map((value) => (
            <Option
              key={value}
              label={t(`signup.types.${value}`)}
              selected={type === value}
              onPress={() => setType(value)}
            />
          ))}
        </View>
      </View>

      <Field label={t('signup.address')} warning={tried && addressMissing ? t('signup.addressMissing') : null}>
        <Input
          invalid={tried && addressMissing}
          value={address}
          onChangeText={setAddress}
          placeholder={t('signup.addressPlaceholder')}
          textContentType="fullStreetAddress"
        />
      </Field>

      <Field label={t('signup.phone')}>
        <View style={styles.phone}>
          <Text font="semibold" style={{ fontSize: 16 }}>
            +57 {formatPhone(account?.phone ?? '')}
          </Text>
        </View>
        <Text style={styles.hint}>{t('signup.phoneHint')}</Text>
      </Field>
    </BagStep>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  phone: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.mist,
    justifyContent: 'center',
  },
  hint: { fontSize: 13, lineHeight: 18, color: colors.grey },
});
